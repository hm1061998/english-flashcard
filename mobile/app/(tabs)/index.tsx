import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/Button";
import {
  vocabularyDb,
  topicsDb,
  LocalFlashcard,
  LocalTopic,
} from "@/database/vocabularyDb";
import { syncService } from "@/utils/syncService";
import { RootState } from "@/store";
import { setTopics } from "@/store/slices/topicSlice";
import { setSelectedTopicId } from "@/store/slices/vocabularySlice";
import NetInfo from "@react-native-community/netinfo";
import { Feather } from "@expo/vector-icons";

const PAGE_SIZE = 20;

interface AddWordFormData {
  word: string;
  definition: string;
  phonetic: string;
  topicId: string;
}

interface AddTopicFormData {
  name: string;
}

export default function HomeScreen() {
  const dispatch = useDispatch();
  const topics = useSelector((state: RootState) => state.topics.items);
  const selectedTopicId = useSelector(
    (state: RootState) => state.vocabulary.selectedTopicId,
  );

  const [localWords, setLocalWords] = useState<LocalFlashcard[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isManagingTopics, setIsManagingTopics] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const {
    control: wordControl,
    handleSubmit: handleWordSubmit,
    reset: resetWordForm,
    setValue: setWordValue,
    watch: watchWordForm,
  } = useForm<AddWordFormData>({
    defaultValues: {
      word: "",
      definition: "",
      phonetic: "",
      topicId: "",
    },
  });

  const {
    control: topicControl,
    handleSubmit: handleTopicSubmit,
    reset: resetTopicForm,
  } = useForm<AddTopicFormData>({
    defaultValues: {
      name: "",
    },
  });

  const currentTopicId = watchWordForm("topicId");

  const loadInitialData = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      const localTopics = await topicsDb.getAll();
      dispatch(setTopics(localTopics));

      const words = await vocabularyDb.getAll(
        PAGE_SIZE,
        0,
        selectedTopicId || undefined,
        searchQuery,
      );
      const totalCount = await vocabularyDb.count(
        selectedTopicId || undefined,
        searchQuery,
      );

      setLocalWords(words);
      setPage(1);
      setHasMore(words.length < totalCount);
    } catch (error) {
      console.error("Failed to load initial data", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [dispatch, selectedTopicId, searchQuery]);

  const loadMoreData = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const offset = page * PAGE_SIZE;
      const nextWords = await vocabularyDb.getAll(
        PAGE_SIZE,
        offset,
        selectedTopicId || undefined,
        searchQuery,
      );

      if (nextWords.length > 0) {
        setLocalWords((prev) => [...prev, ...nextWords]);
        setPage((prev) => prev + 1);

        const totalCount = await vocabularyDb.count(
          selectedTopicId || undefined,
          searchQuery,
        );
        setHasMore(localWords.length + nextWords.length < totalCount);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more data", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncService.fullSync();
      await loadInitialData();
    } catch (error) {
      console.log("Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected) {
        handleSync();
      }
    });
    return () => unsubscribe();
  }, [selectedTopicId, searchQuery]);

  const onAddWord = async (data: AddWordFormData) => {
    try {
      const id = Date.now().toString();
      await vocabularyDb.insert({
        id,
        word: data.word,
        definition: data.definition,
        phonetic: data.phonetic,
        example: "",
        topicId: data.topicId || undefined,
      });
      resetWordForm();
      loadInitialData();
      if (isOnline) handleSync();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu từ vựng");
    }
  };

  const onAddTopic = async (data: AddTopicFormData) => {
    if (!data.name.trim()) return;
    try {
      const id = Date.now().toString();
      await topicsDb.insert({
        id,
        name: data.name.trim(),
        color: "#4f46e5",
      });
      resetTopicForm();
      loadInitialData();
      if (isOnline) handleSync();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thêm chủ đề");
    }
  };

  const handleDeleteTopic = async (id: string) => {
    Alert.alert("Xóa chủ đề", "Bạn có chắc chắn muốn xóa chủ đề này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          await topicsDb.delete(id);
          if (selectedTopicId === id) dispatch(setSelectedTopicId(null));
          if (currentTopicId === id) setWordValue("topicId", "");
          loadInitialData();
        },
      },
    ]);
  };

  const renderTopicChip = ({
    item,
  }: {
    item: LocalTopic | { id: null; name: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.topicChip,
        selectedTopicId === item.id && styles.activeTopicChip,
        item.id === null && selectedTopicId === null && styles.activeTopicChip,
      ]}
      onPress={() => dispatch(setSelectedTopicId(item.id))}
    >
      <Text
        style={[
          styles.topicChipText,
          (selectedTopicId === item.id ||
            (item.id === null && selectedTopicId === null)) &&
            styles.activeTopicChipText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerComponent}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Kho Từ Vựng</Text>
          <TouchableOpacity
            onPress={handleSync}
            disabled={isSyncing}
            style={styles.syncBtn}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#4f46e5" />
            ) : (
              <Feather name="refresh-cw" size={20} color="#4f46e5" />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.statusBadge}>
          <Feather
            name={isOnline ? "wifi" : "wifi-off"}
            size={14}
            color={isOnline ? "#4CD964" : "#FF3B30"}
          />
          <Text
            style={[
              styles.statusText,
              { color: isOnline ? "#4CD964" : "#FF3B30" },
            ]}
          >
            {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
          </Text>
        </View>
      </View>

      <View style={styles.topicFilterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: "Tất cả" }, ...topics]}
          renderItem={renderTopicChip}
          keyExtractor={(item) => item.id || "all"}
          contentContainerStyle={styles.topicListContent}
        />
        <TouchableOpacity
          style={styles.manageTopicsBtn}
          onPress={() => setIsManagingTopics(true)}
        >
          <Feather name="settings" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={18}
          color="#9ca3af"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm từ vựng hoặc ý nghĩa..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Feather name="x" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Thêm từ mới</Text>
        <Controller
          control={wordControl}
          name="word"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Từ tiếng Anh..."
              placeholderTextColor="#9ca3af"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={wordControl}
          name="phonetic"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Phiên âm (/heˈləʊ/)..."
              placeholderTextColor="#9ca3af"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={wordControl}
          name="definition"
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Nghĩa tiếng Việt..."
              placeholderTextColor="#9ca3af"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <Text style={styles.label}>Chủ đề:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.topicPicker}
        >
          <TouchableOpacity
            style={[
              styles.topicOption,
              currentTopicId === "" && styles.activeTopicOption,
            ]}
            onPress={() => setWordValue("topicId", "")}
          >
            <Text
              style={[
                styles.topicOptionText,
                currentTopicId === "" && styles.activeTopicOptionText,
              ]}
            >
              Không có
            </Text>
          </TouchableOpacity>
          {topics.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.topicOption,
                currentTopicId === t.id && styles.activeTopicOption,
              ]}
              onPress={() => setWordValue("topicId", t.id)}
            >
              <Text
                style={[
                  styles.topicOptionText,
                  currentTopicId === t.id && styles.activeTopicOptionText,
                ]}
              >
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button
          title="Lưu từ vựng"
          onPress={handleWordSubmit(onAddWord)}
          loading={isSyncing && isOnline}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh sách từ vựng</Text>
        {isInitialLoading && <ActivityIndicator size="small" color="#4f46e5" />}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {isLoadingMore ? (
        <ActivityIndicator
          size="small"
          color="#4f46e5"
          style={{ marginBottom: 20 }}
        />
      ) : hasMore ? (
        <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMoreData}>
          <Text style={styles.loadMoreText}>Tải thêm từ vựng</Text>
        </TouchableOpacity>
      ) : localWords.length > 0 ? (
        <Text style={styles.endListText}>Đã hiển thị toàn bộ từ vựng</Text>
      ) : null}

      {/* <Text style={styles.env}>API: {process.env.EXPO_PUBLIC_API_URL}</Text> */}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={localWords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <Flashcard
              word={item.word}
              definition={item.definition}
              phonetic={item.phonetic}
              example={item.example}
              topicName={topics.find((t) => t.id === item.topicId)?.name}
            />
            {!item.synced && (
              <View style={styles.syncBadge}>
                <Text style={styles.syncBadgeText}>Chờ đồng bộ</Text>
              </View>
            )}
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !isInitialLoading ? (
            <Text style={styles.emptyText}>Chưa có từ vựng nào.</Text>
          ) : null
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        initialNumToRender={10}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={handleSync}
            colors={["#4f46e5"]}
            tintColor="#4f46e5"
          />
        }
      />

      <Modal
        visible={isManagingTopics}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quản lý chủ đề</Text>
              <TouchableOpacity onPress={() => setIsManagingTopics(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.addTopicRow}>
              <Controller
                control={topicControl}
                name="name"
                rules={{ required: true }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      { flex: 1, marginBottom: 0, marginRight: 10 },
                    ]}
                    placeholder="Tên chủ đề..."
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleTopicSubmit(onAddTopic)}
              >
                <Feather name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={topics}
              keyExtractor={(t) => t.id}
              renderItem={({ item: t }) => (
                <View style={styles.topicItem}>
                  <Text style={styles.topicItemName}>{t.name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteTopic(t.id)}>
                    <Feather name="trash-2" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.topicList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có chủ đề nào.</Text>
              }
            />
            <Button
              title="Đóng"
              onPress={() => setIsManagingTopics(false)}
              variant="outline"
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  headerComponent: {
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  syncBtn: {
    marginLeft: 10,
    padding: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 5,
    textTransform: "uppercase",
  },
  topicFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  topicListContent: {
    paddingRight: 10,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  activeTopicChip: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  topicChipText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: "500",
  },
  activeTopicChipText: {
    color: "#fff",
  },
  manageTopicsBtn: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    marginTop: 5,
  },
  input: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  topicPicker: {
    flexDirection: "row",
    marginBottom: 15,
  },
  topicOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  activeTopicOption: {
    backgroundColor: "#4f46e5",
  },
  topicOptionText: {
    fontSize: 12,
    color: "#6b7280",
  },
  activeTopicOptionText: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  cardWrapper: {
    width: "100%",
    marginBottom: 12,
  },
  syncBadge: {
    position: "absolute",
    top: -5,
    right: 10,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  syncBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#92400e",
  },
  emptyText: {
    color: "#9ca3af",
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
  footer: {
    marginTop: 10,
    paddingBottom: 40,
  },
  loadMoreBtn: {
    padding: 15,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 14,
  },
  endListText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    marginVertical: 15,
    fontStyle: "italic",
  },
  env: {
    fontSize: 10,
    color: "#d1d5db",
    textAlign: "center",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addTopicRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  addBtn: {
    backgroundColor: "#4f46e5",
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  topicList: {
    marginBottom: 20,
  },
  topicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  topicItemName: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
});
