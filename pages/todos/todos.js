Page({
  data: {
    input: "",
    categories: ["工作", "学习", "生活"],
    selectedCategory: "工作",
    todos: [],
    filteredTodos: [],
    leftCount: 0,
    allCompleted: false,
    searchKey: "",
    logs: [],
    toastHidden: true
  },

  onLoad() {
    this.load();
  },

  /* ========== 搜索功能 ========== */
  onSearchInput(e) {
    const key = e.detail.value.toLowerCase();
    this.setData({ searchKey: key });

    this.applyFilter();
  },

  /* 搜索过滤逻辑 */
  applyFilter() {
    let key = this.data.searchKey;
    let todos = this.data.todos;

    if (!key.trim()) {
      this.setData({ filteredTodos: todos });
      return;
    }

    let filtered = todos.filter(item =>
      item.name.toLowerCase().includes(key) ||
      item.category.toLowerCase().includes(key)
    );

    this.setData({ filteredTodos: filtered });
  },


  /* 分类选择 */
  onCategoryChange(e) {
    this.setData({
      selectedCategory: this.data.categories[e.detail.value]
    });
  },

  /* 输入框变化 */
  inputChangeHandle(e) {
    this.setData({ input: e.detail.value });
  },

  /* 添加任务 */
  addTodoHandle() {
    if (!this.data.input || !this.data.input.trim()) return

    const newTodo = {
      name: this.data.input,
      completed: false,
      category: this.data.selectedCategory
    };

    let todos = this.data.todos;
    todos.push(newTodo);

    let logs = this.data.logs;
    logs.push({
      timestamp: new Date(),
      action: "Add",
      name: this.data.input
    });

    this.setData({
      input: "",
      todos,
      leftCount: this.data.leftCount + 1,
      logs
    });

    this.save();
    this.applyFilter();
  },

  /* 切换任务状态 */
  toggleTodoHandle(e) {
    let index = e.currentTarget.dataset.index;

    // filteredTodos 索引 → 原 todos 索引
    let realTask = this.data.filteredTodos[index];
    let realIndex = this.data.todos.findIndex(t => t === realTask);

    let todos = this.data.todos;
    todos[realIndex].completed = !todos[realIndex].completed;

    this.setData({
      todos,
      leftCount: todos.filter(t => !t.completed).length
    });

    this.save();
    this.applyFilter();
  },

  /* 删除任务 */
  removeTodoHandle(e) {
    let index = e.currentTarget.dataset.index;
    let realTask = this.data.filteredTodos[index];

    let todos = this.data.todos.filter(t => t !== realTask);

    this.setData({
      todos,
      leftCount: todos.filter(t => !t.completed).length
    });

    this.save();
    this.applyFilter();
  },

  /* 全选 */
  toggleAllHandle() {
    this.data.allCompleted = !this.data.allCompleted;

    let todos = this.data.todos;
    todos.forEach(item => (item.completed = this.data.allCompleted));

    this.setData({
      todos,
      leftCount: this.data.allCompleted ? 0 : todos.length
    });

    this.save();
    this.applyFilter();
  },

  /* 清除已完成 */
  clearCompletedHandle() {
    let remains = this.data.todos.filter(item => !item.completed);
    this.setData({
      todos: remains,
      leftCount: remains.length,
      toastHidden: false
    });

    this.save();
    this.applyFilter();

    wx.vibrateShort();
  },

  hideToast() {
    this.setData({ toastHidden: true });
  },

  /* 数据存储 */
  save() {
    wx.setStorageSync("todo_list", this.data.todos);
  },

  load() {
    let todos = wx.getStorageSync("todo_list") || [];
    let leftCount = todos.filter(item => !item.completed).length;

    this.setData({
      todos,
      filteredTodos: todos,
      leftCount
    });
  }
});
