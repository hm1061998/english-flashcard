import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "@/components/Button/Button";
import Table from "@/components/Table/Table";
import type { Column } from "@/components/Table/Table";
import FlashcardForm from "@/components/FlashcardForm/FlashcardForm";
import * as XLSX from "xlsx";
import { apiService } from "@/services/api";
import { modalService, Modal } from "@/libs/Modal";
import { toastService } from "@/libs/Toast";
import "./VocabularyListPage.less";

interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example?: string;
  createdAt?: string;
}

const VocabularyListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [myWords, setMyWords] = useState<Word[]>([]);

  // Pagination & Sort State
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState<"ASC" | "DESC">("DESC");
  const PAGE_SIZE = 10;

  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchWords = useCallback(
    async (targetPage: number, search: string, sort: string, ord: string) => {
      setLoading(true);
      try {
        const response: any = await apiService.get(
          `/flashcards?page=${targetPage}&limit=${PAGE_SIZE}&search=${search}&sortBy=${sort}&order=${ord}`,
        );

        const data = response.data || [];
        const meta = response.meta || { total: 0 };

        if (data.length === 0 && targetPage > 1) {
          setPage(targetPage - 1);
          return;
        }

        setMyWords(data);
        setTotalItems(meta.total);
      } catch (err) {
        console.error("Failed to fetch words", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchWords(page, debouncedSearch, sortBy, order);
  }, [isAuthenticated, page, debouncedSearch, sortBy, order, fetchWords]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    const confirmed = await modalService.danger(
      "Bạn có chắc chắn muốn xóa từ vựng này không? Hành động này không thể hoàn tác.",
      "Xóa từ vựng",
    );
    if (!confirmed) return;
    try {
      await apiService.delete(`/flashcards/${id}`);
      toastService.success("Đã xóa từ vựng thành công!");
      fetchWords(page, debouncedSearch, sortBy, order);
    } catch (err) {
      toastService.error("Không thể xóa từ vựng. Vui lòng thử lại.");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    const confirmed = await modalService.danger(
      `Bạn có chắc chắn muốn xóa ${ids.length} từ đã chọn không?`,
      "Xóa hàng loạt",
    );
    if (!confirmed) return;
    try {
      await Promise.all(
        ids.map((id) => apiService.delete(`/flashcards/${id}`)),
      );
      toastService.success(`Đã xóa thành công ${ids.length} từ!`);
      fetchWords(page, debouncedSearch, sortBy, order);
    } catch (err) {
      toastService.error("Có lỗi xảy ra khi xóa hàng loạt");
      fetchWords(page, debouncedSearch, sortBy, order);
    }
  };

  const handleCreate = async (formData: any) => {
    setFormLoading(true);
    try {
      await apiService.post("/flashcards", formData);
      setIsAdding(false);
      toastService.success("Đã thêm từ mới thành công!");
      fetchWords(1, debouncedSearch, sortBy, order);
    } catch (err) {
      toastService.error(err || "Không thể thêm từ mới");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!editingWord) return;
    setFormLoading(true);
    try {
      await apiService.patch(`/flashcards/${editingWord.id}`, formData);
      setEditingWord(null);
      toastService.success("Cập nhật từ vựng thành công!");
      fetchWords(page, debouncedSearch, sortBy, order);
    } catch (err) {
      toastService.error("Không thể cập nhật từ vựng");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSort = (key: string, newOrder: "ASC" | "DESC") => {
    setLoading(true);
    setSortBy(key);
    setOrder(newOrder);
    setPage(1);
  };

  const columns: Column<Word>[] = [
    {
      header: "Từ vựng",
      key: "word",
      width: "30%",
      sortable: true,
      render: (w: Word) => (
        <div className="word-cell">
          <strong className="word-text">{w.word}</strong>
          <br />
          <span className="phonetic-text">{w.phonetic}</span>
        </div>
      ),
    },
    { header: "Nghĩa của từ", key: "meaning", width: "35%", sortable: true },
    {
      header: "Ngày tạo",
      key: "createdAt",
      width: "15%",
      align: "center",
      sortable: true,
      render: (w: Word) =>
        w.createdAt ? (
          <span className="date-text">
            {new Date(w.createdAt).toLocaleDateString("vi-VN")}
          </span>
        ) : (
          "-"
        ),
    },
    {
      header: "Thao tác",
      key: "actions",
      width: "20%",
      align: "right",
      render: (w: Word) => (
        <div className="action-buttons">
          <button className="edit-btn" onClick={() => setEditingWord(w)}>
            Sửa
          </button>
          <button className="delete-btn" onClick={() => handleDelete(w.id)}>
            Xóa
          </button>
        </div>
      ),
    },
  ];

  const exportTemplate = () => {
    const instructions = [
      ["HƯỚNG DẪN NHẬP LIỆU"],
      ["1. Cột 'Từ vựng': Nhập từ tiếng Anh cần học (Bắt buộc)"],
      ["2. Cột 'Phiên âm': Nhập phiên âm của từ (Không bắt buộc)"],
      ["3. Cột 'Nghĩa của từ': Nhập nghĩa tiếng Việt (Bắt buộc)"],
      ["4. Cột 'Ví dụ': Nhập câu ví dụ minh họa (Không bắt buộc)"],
      [""],
      ["Từ vựng", "Phiên âm", "Nghĩa của từ", "Ví dụ"],
      ["Hello", "/həˈləʊ/", "Xin chào", "Hello everyone!"],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(instructions);
    ws["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 40 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Mau_Nhap_Tu_Vung.xlsx");
    toastService.info("Đã tải xuống file mẫu!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const jsonData: any[] = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { header: 1 },
      );
      const newWords = [];
      for (let i = 7; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row[0] && row[2]) {
          newWords.push({
            word: String(row[0]).trim(),
            phonetic: row[1] ? String(row[1]).trim() : "",
            meaning: String(row[2]).trim(),
            example: row[3] ? String(row[3]).trim() : "",
          });
        }
      }
      if (newWords.length > 0) {
        try {
          await apiService.post("/flashcards/bulk", newWords);
          toastService.success(`Đã nhập thành công ${newWords.length} từ!`);
          fetchWords(1, "", sortBy, order);
        } catch (err) {
          toastService.error("Có lỗi xảy ra khi nhập dữ liệu");
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="vocab-list-page container">
      <div className="notebook-page">
        <header className="page-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate("/")}>
              ←
            </button>
            <div className="title-group">
              <h1>
                Kho Từ Vựng
                <span>({totalItems} từ)</span>
              </h1>
            </div>
          </div>
          <div className="header-actions">
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
              + Thêm từ
            </Button>
            <Button variant="ghost" size="sm" onClick={exportTemplate}>
              Mẫu Excel
            </Button>
            <label className="btn btn-ghost btn-sm">
              Nhập Excel
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImport}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </header>

        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm từ vựng hoặc nghĩa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="content-area">
          <Modal
            isOpen={isAdding}
            onClose={() => setIsAdding(false)}
            title="Thêm từ vựng mới"
          >
            <FlashcardForm
              onSubmit={handleCreate}
              onCancel={() => setIsAdding(false)}
              submitLabel="Thêm mới"
              loading={formLoading}
            />
          </Modal>

          <Modal
            isOpen={!!editingWord}
            onClose={() => setEditingWord(null)}
            title="Sửa từ vựng"
          >
            <FlashcardForm
              initialData={
                editingWord
                  ? {
                      word: editingWord.word,
                      phonetic: editingWord.phonetic,
                      meaning: editingWord.meaning,
                      example: editingWord.example || "",
                    }
                  : undefined
              }
              onSubmit={handleUpdate}
              onCancel={() => setEditingWord(null)}
              submitLabel="Cập nhật"
              loading={formLoading}
            />
          </Modal>

          {loading ? (
            <div className="loading-state">Đang tải dữ liệu...</div>
          ) : (
            <Table
              columns={columns}
              data={myWords}
              pageSize={PAGE_SIZE}
              onDeleteSelected={handleBulkDelete}
              rowKey="id"
              isServerSide={true}
              totalItems={totalItems}
              currentPage={page}
              onPageChange={(p) => setPage(p)}
              sortBy={sortBy}
              order={order}
              onSort={handleSort}
              loading={loading}
            />
          )}
        </div>

        <footer className="page-footer">
          <p>
            Tổng cộng: <strong>{totalItems}</strong> từ vựng cá nhân
          </p>
        </footer>
      </div>
    </div>
  );
};

export default VocabularyListPage;
