// ELEMENTOS

// Stats
const totalCount = document.querySelector("#totalCount");
const pendingCount = document.querySelector("#pendingCount");
const doneCount = document.querySelector("#doneCount");
const progressBar = document.querySelector("#progressBar");
const progressPercentage = document.querySelector("#progressPercentage");
const clearTasksDone = document.querySelector("#clearTasksDone");

// Formulário de nova tarefa
const newTaskForm = document.querySelector("#newTaskForm");
const titleInput = document.querySelector("#titleInput");
const prioritySelect = document.querySelector("#prioritySelect");

// Busca de tarefas
const findInput = document.querySelector("#findInput");

// Filtros de exibição
const priorityFilter = document.querySelector("#priorityFilter");
const statusSelector = document.querySelector("#statusSelector");

// Tarefas
const tasksCount = document.querySelector("#tasksCount");
const taskList = document.querySelector("#taskList");

// Modal de Deleção
const deleteModal = document.querySelector("#deleteModal");
const confirmDelete = document.querySelector("#confirmDelete");

// Modal de Edição
const editModal = document.querySelector("#editModal");
const editTitleInput = document.querySelector("#editTitleInput");
const editPriority = document.querySelector("#editPriority");
const saveEdit = document.querySelector("#saveEdit");



// ESTADO DA APLICAÇÃO
let tasks = [];
let currentTaskId;


// FUNÇÕES REUTILIZÁVEIS
const generateId = () => {

    return Date.now();

};

const formatDate = (date) => {

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2,"0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear());
    const weekDay = String(d.getDay());
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} (${weekDay}) às ${hours}:${minutes}`;

};

const getPriorityText = (priority) => {

    const text = {
        low: "Baixa prioridade",
        medium: "Média prioridade",
        high: "Alta prioridade"
    };
    
    return text[priority];

};

const getPriorityEmoji = (priority) => {

    const emoji = {
        low: "🟢",
        medium: "🟡",
        high: "🔴"
    };

    return emoji[priority];

};


// SALVAR DADOS NO NAVEGADOR
const saveTask = () => {

    localStorage.setItem("tasks_taskFlow", JSON.stringify(tasks));

};

const loadTasks = () => {

    const savedTasks = localStorage.getItem("tasks_taskFlow");

    if(savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [];
    }

};

const darkModeStatus = (status) => {

    localStorage.setItem("darkMode_taskFlow", status);

};

const loadDarkMode = () => {

    const darkMode = localStorage.getItem("darkMode_taskFlow");
    darkMode === "true";
    return darkMode;

};


// STATS
const updateStats = () => {

    const total = tasks.length;
    const completed = tasks.filter(task => task.done).length;
    const pending = total - completed;

    const percentage = total > 0 ? Math.round((completed / total) * 100): 0;

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    progressPercentage.textContent = `${percentage}%`;
    progressBar.style.width = `${percentage}%`;

};

const clearCompletedTAsks = () => {

    tasks = tasks.filter(task => !task.done);

    saveTask();
    filterTasks();
    updateStats();

};


// CRIANDO TAREFAS
const createNewTask = (title, priority) => {

    const newTask = {
        id: generateId(),
        title: title,
        priority: priority,
        done: false,
        creationDate: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTask();
    showTasks();
    updateStats();
    updateStats();

};

const createTaskCard = (task) => {

    const card = document.createElement("div");
    card.classList.add("task-card");
    card.classList.add(`priority-${task.priority}`);
    card.dataset.id = task.id;

    if(task.done) {
        card.classList.add("done");
    }

    card.innerHTML = `
        <div class="task-content">
            <input type="checkbox" id="taskCheckbox" ${task.done ? "checked": ""}>
            <div class="task-info"> 
                <span class="task-title">${task.title}</span>
                <div class="task-details"> 
                    <span class="task-date">📆 ${formatDate(task.creationDate)}</span>
                    <span class="task-priority-span">
                        ${getPriorityEmoji(task.priority)} ${getPriorityText(task.priority)}
                    </span>
                </div>
            </div>
        </div>
        <div class="task-actions"> 
            <button id="editTaskButton">🖊 Editar</button>
            <button id="deleteTaskButton">🗑 Excluir</button>
        </div>
    `;

    const editTaskButton = card.querySelector("#editTaskButton");
    const deleteTaskButton = card.querySelector("#deleteTaskButton");
    const taskCheckbox = card.querySelector("#taskCheckbox");

    editTaskButton.addEventListener("click", () => {

        openEditModal(task.id);

    });

    deleteTaskButton.addEventListener("click", () => {

        openDeleteModal(task.id);

    });

    taskCheckbox.addEventListener("change", () => {

        toggleTaskStatus(task.id);

    });

    return card;

};

// LENDO E EXIBINDO TAREFAS
const filterTasks = () => {

    let filteredTasks = [...tasks];

    const searchText = findInput.value.toLowerCase();
    filteredTasks = filteredTasks.filter(task => task.title.toLowerCase().includes(searchText));


    const statusValue = statusSelector.value;
    if(statusValue !== "all") {
        filteredTasks = filteredTasks.filter(task => {
            if(statusValue === "done") {
                return task.done === true;
            } else {
                return task.done === false;
            }
        });
    }


    const priorityValue = priorityFilter.value;
    if(priorityValue !== "all") {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityValue);
    }

    showTasks(filteredTasks);

};

const showTasks = (tasksArray) => {

    taskList.innerHTML = "";

    tasksArray.forEach(task => {

        const card = createTaskCard(task);
        taskList.appendChild(card);

    });

    tasksCount.textContent = tasksArray.length;

};



// EDITANDO TAREFA
const toggleTaskStatus = (id) => {

    const task = tasks.find(task => task.id === id);

    if(task) {

        task.done = !task.done;

        saveTask();
        filterTasks();
        updateStats();

    }

};

const openEditModal = (id) => {

    currentTaskId = id;
    const task = tasks.find(task => task.id === id);

    if(task) {

        editTitleInput.value = task.title;
        editPriority.value = task.priority;

        editModal.showModal();

    }

};

const saveEditTask = () => {

    const task = tasks.find(task => task.id === currentTaskId);

    if(task) {

        task.title = editTitleInput.value;
        task.priority = editPriority.value;

        saveTask();
        filterTasks();
        updateStats();

        currentTaskId = null;

    }

};


// DELETANDO TAREFA
const openDeleteModal = (id) => {

    currentTaskId = id;
    deleteModal.showModal();

};

const confirmDeleteTask = () => {

    tasks = tasks.filter(task => task.id !== currentTaskId);

    saveTask();
    filterTasks();
    updateStats();

    currentTaskId = null;

};