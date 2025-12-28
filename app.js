// To-Do List Application
class TodoList {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.suggestionsContainer = document.getElementById('suggestions');
        this.selectedSuggestionIndex = -1;
        this.currentSuggestions = [];
        this.fallingCharsCount = 0;
        this.maxFallingChars = 50; // Limit concurrent falling characters

        // Common task suggestions
        this.suggestions = [
            'Buy groceries',
            'Call mom',
            'Go to gym',
            'Study for exam',
            'Finish project',
            'Schedule meeting',
            'Pay bills',
            'Clean the house',
            'Cook dinner',
            'Read a book',
            'Do laundry',
            'Visit doctor',
            'Send email',
            'Plan vacation',
            'Exercise',
            'Write report',
            'Attend meeting',
            'Fix car',
            'Water plants',
            'Walk the dog'
        ];

        // Event listeners
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.selectedSuggestionIndex >= 0 && this.currentSuggestions.length > 0) {
                    // Select highlighted suggestion
                    this.selectSuggestion(this.currentSuggestions[this.selectedSuggestionIndex]);
                } else {
                    this.hideSuggestions();
                    this.addTask();
                }
            } else {
                // Create falling character animation
                this.createFallingChar(e.key);
            }
        });
        
        // Keyboard navigation for suggestions
        this.taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedSuggestionIndex = Math.min(
                    this.selectedSuggestionIndex + 1,
                    this.currentSuggestions.length - 1
                );
                this.highlightSuggestion();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
                this.highlightSuggestion();
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
                this.selectedSuggestionIndex = -1;
            }
        });
        this.taskInput.addEventListener('input', (e) => {
            this.showSuggestions(e.target.value);
            // Also create falling char for input events (for paste, etc.)
            if (e.inputType === 'insertText' && e.data) {
                this.createFallingChar(e.data);
            }
        });
        this.taskInput.addEventListener('focus', (e) => {
            if (e.target.value.length > 0) {
                this.showSuggestions(e.target.value);
            }
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-wrapper')) {
                this.hideSuggestions();
            }
        });
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        this.render();
    }

    showSuggestions(inputValue) {
        const value = inputValue.toLowerCase().trim();
        
        if (value.length === 0) {
            this.hideSuggestions();
            return;
        }

        const filtered = this.suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(value)
        );

        if (filtered.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.currentSuggestions = filtered.slice(0, 5);
        this.selectedSuggestionIndex = -1;

        this.suggestionsContainer.innerHTML = this.currentSuggestions
            .map((suggestion, index) => {
                const escaped = this.escapeHtml(suggestion);
                return `
                    <div class="suggestion-item" 
                         data-index="${index}"
                         onclick="todoList.selectSuggestion('${escaped.replace(/'/g, "\\'")}')">
                        ${escaped}
                    </div>
                `;
            }).join('');

        this.suggestionsContainer.style.display = 'block';
    }

    highlightSuggestion() {
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        items.forEach((item, index) => {
            if (index === this.selectedSuggestionIndex) {
                item.classList.add('highlighted');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }

    selectSuggestion(suggestion) {
        this.taskInput.value = suggestion;
        this.hideSuggestions();
        this.selectedSuggestionIndex = -1;
        this.taskInput.focus();
    }

    createFallingChar(char, delay = 0) {
        // Skip special keys (only for typing, not for task completion)
        if (delay === 0 && (char.length !== 1 || char === 'Enter' || char === 'Backspace' || char === 'Delete')) {
            return;
        }

        // Limit concurrent falling characters for performance
        if (this.fallingCharsCount >= this.maxFallingChars) {
            return;
        }

        setTimeout(() => {
            // Create falling character element
            const fallingChar = document.createElement('div');
            fallingChar.className = 'falling-char';
            fallingChar.textContent = char;
            
            // Random horizontal position
            const randomX = Math.random() * window.innerWidth;
            fallingChar.style.left = randomX + 'px';
            fallingChar.style.top = '-50px';
            
            // Random rotation direction
            const rotation = Math.random() * 360;
            fallingChar.style.setProperty('--rotation', rotation + 'deg');
            
            // Random color variation
            const colors = [
                'rgba(255, 255, 255, 0.9)',
                'rgba(255, 200, 200, 0.8)',
                'rgba(200, 255, 200, 0.8)',
                'rgba(200, 200, 255, 0.8)',
                'rgba(255, 255, 150, 0.8)',
                'rgba(255, 150, 255, 0.8)',
                'rgba(150, 255, 255, 0.8)'
            ];
            fallingChar.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Random size
            const size = 20 + Math.random() * 15;
            fallingChar.style.fontSize = size + 'px';
            
            document.body.appendChild(fallingChar);
            this.fallingCharsCount++;
            
            // Remove element after animation
            setTimeout(() => {
                if (fallingChar.parentNode) {
                    fallingChar.parentNode.removeChild(fallingChar);
                    this.fallingCharsCount--;
                }
            }, 3000);
        }, delay);
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (text === '') return;

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.taskInput.value = '';
        this.hideSuggestions();
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    createFallingCharsFromTask(taskText) {
        // Create falling characters for each letter in the task
        const chars = taskText.split('');
        chars.forEach((char, index) => {
            if (char.trim() !== '') {
                // Stagger the characters with a delay
                this.createFallingChar(char, index * 50);
            }
        });
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const taskItem = document.querySelector(`[data-task-id="${id}"]`);
        if (!taskItem) return;

        const taskText = taskItem.querySelector('.task-text');
        const currentText = task.text;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'task-edit-input';
        
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                task.text = newText;
                this.saveTasks();
            }
            this.render();
        };

        const cancelEdit = () => {
            this.render();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });

        taskText.replaceWith(input);
        input.focus();
        input.select();
    }

    clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);
        
        if (completedTasks.length === 0) return;
        
        // Confirmation for clearing multiple tasks
        if (completedTasks.length > 3 && !confirm(`Are you sure you want to clear ${completedTasks.length} completed tasks?`)) {
            return;
        }
        
        // Animate each completed task falling
        completedTasks.forEach((task, index) => {
            const taskItem = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskItem) {
                // Get task position for animation
                const rect = taskItem.getBoundingClientRect();
                taskItem.style.position = 'fixed';
                taskItem.style.left = rect.left + 'px';
                taskItem.style.top = rect.top + 'px';
                taskItem.style.width = rect.width + 'px';
                
                // Stagger the animations
                setTimeout(() => {
                    taskItem.classList.add('completing');
                    
                    // Create falling characters from task text
                    this.createFallingCharsFromTask(task.text);
                }, index * 100); // Stagger each task by 100ms
            }
        });
        
        // Remove all completed tasks after animation
        setTimeout(() => {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }, (completedTasks.length * 100) + 1200); // Wait for all animations + animation duration
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <p>📝</p>
                    <p>No tasks ${this.currentFilter !== 'all' ? `(${this.currentFilter})` : ''}</p>
                </div>
            `;
        } else {
            this.taskList.innerHTML = filteredTasks.map(task => `
                <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="todoList.toggleTask(${task.id})"
                    >
                    ${!task.completed ? `<span class="task-icon">${this.getTaskIcon(task.text)}</span>` : ''}
                    <span class="task-text" ondblclick="todoList.editTask(${task.id})">${this.escapeHtml(task.text)}</span>
                    <button 
                        class="task-edit" 
                        onclick="todoList.editTask(${task.id})"
                        title="Edit task"
                    >
                        ✏️
                    </button>
                    <button 
                        class="task-delete" 
                        onclick="todoList.deleteTask(${task.id})"
                        title="Delete task"
                    >
                        🗑️
                    </button>
                </li>
            `).join('');
        }

        const activeTasks = this.tasks.filter(t => !t.completed).length;
        const totalTasks = this.tasks.length;
        this.taskCount.textContent = `${activeTasks} of ${totalTasks} tasks remaining`;
    }

    getTaskIcon(text) {
        const lowerText = text.toLowerCase();
        
        // Work/Business
        if (lowerText.match(/\b(work|meeting|project|deadline|report|presentation|office|business|client|boss)\b/)) {
            return '💼';
        }
        // Shopping
        if (lowerText.match(/\b(buy|shop|shopping|grocery|store|market|purchase)\b/)) {
            return '🛒';
        }
        // Study/Learning
        if (lowerText.match(/\b(study|learn|read|homework|exam|test|assignment|course|book|class)\b/)) {
            return '📚';
        }
        // Exercise/Fitness
        if (lowerText.match(/\b(exercise|gym|workout|run|jog|fitness|yoga|sport|training)\b/)) {
            return '💪';
        }
        // Health/Medical
        if (lowerText.match(/\b(doctor|hospital|medicine|appointment|health|checkup|dentist|clinic)\b/)) {
            return '🏥';
        }
        // Home/Household
        if (lowerText.match(/\b(clean|laundry|dishes|house|home|room|organize|fix|repair)\b/)) {
            return '🏠';
        }
        // Food/Cooking
        if (lowerText.match(/\b(cook|food|meal|dinner|lunch|breakfast|recipe|kitchen|eat|restaurant)\b/)) {
            return '🍳';
        }
        // Call/Phone
        if (lowerText.match(/\b(call|phone|dial|contact|ring)\b/)) {
            return '📞';
        }
        // Email
        if (lowerText.match(/\b(email|mail|send|message|inbox)\b/)) {
            return '📧';
        }
        // Travel
        if (lowerText.match(/\b(travel|trip|flight|airport|hotel|vacation|journey|visit)\b/)) {
            return '✈️';
        }
        // Meeting/Appointment
        if (lowerText.match(/\b(meet|appointment|schedule|date|time|calendar)\b/)) {
            return '📅';
        }
        // Money/Finance
        if (lowerText.match(/\b(pay|bill|money|bank|finance|budget|expense|salary)\b/)) {
            return '💰';
        }
        // Entertainment
        if (lowerText.match(/\b(movie|watch|game|play|entertainment|fun|party|celebrate)\b/)) {
            return '🎬';
        }
        // Default icon
        return '📌';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize the application
const todoList = new TodoList();

