class StorageManager {
    static getTasks() {
        return JSON.parse(localStorage.getItem('pro_tasks') || '[]');
    }

    static saveTasks(tasks) {
        localStorage.setItem('pro_tasks', JSON.stringify(tasks));
    }

    static addTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
    }

    static toggleTask(id) {
        const tasks = this.getTasks();
        const task = tasks.find(x => x.id == id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks(tasks);
        }
    }

    static deleteTask(id) {
        this.saveTasks(this.getTasks().filter(x => x.id != id));
    }
}

class UIController {
    static init() {
        const el = document.getElementById('dateDisplay');
        if (el) {
            el.textContent = new Date().toLocaleDateString('uz-UZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (document.getElementById('taskList')) {
            this.renderTasks();
            this.setupFilters();
        }

        if (document.getElementById('taskForm')) {
            this.setupForm();
        }
    }

    static renderTasks(filter = 'all', search = '') {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;

        let tasks = StorageManager.getTasks();

        if (filter === 'completed') tasks = tasks.filter(t => t.completed);
        if (filter === 'pending') tasks = tasks.filter(t => !t.completed);
        if (search) tasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

        if (tasks.length === 0) {
            taskList.innerHTML = '<p style="text-align:center; color:#8b92a5; padding: 40px;">Vazifalar yo\'q...</p>';
            return;
        }

        let html = '';
        tasks.forEach(task => {
            const priorityText = task.priority ? task.priority.toUpperCase() : '';
            const deadlineText = task.deadline ? task.deadline : '';

            html += `
                <div class="task-card ${task.completed ? 'completed' : ''}" style="display:flex; align-items:center; gap:12px; margin-bottom:10px;">
                    <input type="checkbox" onchange="window.app.toggle('${task.id}')" ${task.completed ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
                    <div style="flex:1">
                        <h3 class="task-title" style="margin:0; ${task.completed ? 'text-decoration:line-through; opacity:0.6;' : ''}">${task.title}</h3>
                        <small style="color:#8b92a5">${deadlineText} ${priorityText ? '| ' + priorityText : ''}</small>
                    </div>
                    <button onclick="window.app.delete('${task.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:600;">O'chirish</button>
                </div>
            `;
        });

        taskList.innerHTML = html;
    }

    static setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const searchVal = document.getElementById('searchInput')?.value || '';
                this.renderTasks(e.target.dataset.filter, searchVal);
            });
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
                this.renderTasks(activeFilter, e.target.value);
            });
        }
    }

    static setupForm() {
        const form = document.getElementById('taskForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const titleEl = document.getElementById('taskTitle');
            const priorityEl = document.getElementById('taskPriority');
            const deadlineEl = document.getElementById('taskDeadline');

            if (!titleEl || !titleEl.value.trim()) return;

            const task = {
                id: Date.now().toString(),
                title: titleEl.value.trim(),
                priority: priorityEl ? priorityEl.value : 'low',
                deadline: deadlineEl ? deadlineEl.value : '',
                completed: false
            };

            StorageManager.addTask(task);

            // Agar vazifalar ro'yxati shu sahifaning o'zida bo'lsa render qiladi, bo'lmasa index.html ga o'tadi
            if (document.getElementById('taskList')) {
                form.reset();
                const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
                const searchVal = document.getElementById('searchInput')?.value || '';
                this.renderTasks(activeFilter, searchVal);
            } else {
                window.location.href = 'index.html';
            }
        });
    }
}

window.app = {
    toggle: (id) => {
        StorageManager.toggleTask(id);
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const searchVal = document.getElementById('searchInput')?.value || '';
        UIController.renderTasks(activeFilter, searchVal);
    },
    delete: (id) => {
        StorageManager.deleteTask(id);
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const searchVal = document.getElementById('searchInput')?.value || '';
        UIController.renderTasks(activeFilter, searchVal);
    }
};

document.addEventListener('DOMContentLoaded', () => UIController.init());