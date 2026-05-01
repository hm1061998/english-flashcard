import React, { useState } from "react";
import "./Table.less";

export interface Column<T> {
  header: string;
  key: keyof T | string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onDeleteSelected?: (selectedIds: string[]) => void;
  rowKey: keyof T;
  isServerSide?: boolean;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  sortBy?: string;
  order?: "ASC" | "DESC";
  onSort?: (key: string, order: "ASC" | "DESC") => void;
  loading?: boolean;
}

const Table = <T extends { id: string }>({
  columns,
  data,
  pageSize = 10,
  onDeleteSelected,
  rowKey,
  isServerSide = false,
  totalItems = 0,
  currentPage: externalPage = 1,
  onPageChange,
  sortBy,
  order,
  onSort,
  loading = false,
}: TableProps<T>) => {
  const [internalPage, setInternalPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const currentPage = isServerSide ? externalPage : internalPage;
  const totalCount = isServerSide ? totalItems : data.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  const currentData = isServerSide
    ? data
    : data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (newPage: number) => {
    if (isServerSide && onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentData.length && currentData.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentData.map((item) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDeleteBulk = () => {
    if (onDeleteSelected && selectedIds.length > 0) {
      onDeleteSelected(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleSortClick = (key: string) => {
    if (!onSort) return;
    const newOrder = sortBy === key && order === "ASC" ? "DESC" : "ASC";
    onSort(key, newOrder);
  };

  return (
    <div className={`custom-table-container ${loading ? "table-loading" : ""}`}>
      {loading && <div className="table-loading-bar" />}

      {selectedIds.length > 0 && !loading && (
        <div className="table-bulk-actions">
          <span>Đã chọn {selectedIds.length} mục</span>
          <button className="bulk-delete-btn" onClick={handleDeleteBulk}>
            Xóa đã chọn
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="custom-table">
          <colgroup>
            <col style={{ width: "50px" }} />
            {columns.map((col, idx) => (
              <col key={idx} style={{ width: col.width || "auto" }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="checkbox-col">
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={
                    currentData.length > 0 &&
                    selectedIds.length === currentData.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    textAlign: col.align || "left",
                    cursor: col.sortable && !loading ? "pointer" : "default",
                  }}
                  onClick={() =>
                    col.sortable &&
                    !loading &&
                    handleSortClick(col.key as string)
                  }
                  className={col.sortable ? "sortable-header" : ""}
                >
                  {col.header}
                  {col.sortable && sortBy === col.key && (
                    <span className="sort-icon">
                      {order === "ASC" ? " ↑" : " ↓"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? // Skeleton rows
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td className="checkbox-col">
                      <div
                        className="skeleton-box"
                        style={{
                          width: "16px",
                          height: "16px",
                          margin: "auto",
                        }}
                      />
                    </td>
                    {columns.map((_, j) => (
                      <td key={j}>
                        <div
                          className="skeleton-box"
                          style={{
                            height: "14px",
                            width: j === 0 ? "70%" : "90%",
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : currentData.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedIds.includes(item.id) ? "selected" : ""}
                  >
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </td>
                    {columns.map((col, idx) => (
                      <td key={idx} style={{ textAlign: col.align || "left" }} data-label={col.header}>
                        {col.render
                          ? col.render(item)
                          : (item[col.key as keyof T] as any)}
                      </td>
                    ))}
                  </tr>
                ))}
            {!loading && currentData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="empty-row">
                  Trống
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Trước
          </button>
          <span className="pagination-info">
            Trang <strong>{currentPage}</strong> / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
