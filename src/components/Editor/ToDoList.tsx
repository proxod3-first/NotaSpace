import * as React from "react";
import { PluginComponent } from "react-markdown-editor-lite";

// Типизация состояния компонента плагина
interface TodoListPluginState {}

export default class TodoListPlugin extends PluginComponent<TodoListPluginState> {
  static pluginName = "my-todolist";
  static align = "left"; // Позиция кнопки на панели
  static defaultConfig = {}; // Конфигурация по умолчанию

  constructor(props: any) {
    super(props);
    this.state = {}; // Инициализация состояния

    // Привязываем методы к текущему контексту
    this.handleClick = this.handleClick.bind(this);
    this.toggleCheckboxes = this.toggleCheckboxes.bind(this);
  }

  // Вставка строки с новой задачей
  handleClick() {
    const taskLine = `- [ ] New Task`; // Текст задачи с незаполненным чекбоксом
    this.editor.insertText(taskLine + "\n"); // Вставляем строку в редактор
  }

  // Обработка клика на чекбоксе
  handleCheckboxClick(text: string) {
    // Если строка начинается с незаполненного чекбокса, меняем на заполненный
    if (text.startsWith("- [ ]")) {
      return text.replace("- [ ]", "- [x]"); // Переключаем на заполненный чекбокс
    } else if (text.startsWith("- [x]")) {
      return text.replace("- [x]", "- [ ]"); // Переключаем на незаполненный чекбокс
    }
    return text; // Возвращаем текст без изменений, если нет чекбокса
  }

  // Переключение состояния всех чекбоксов в редакторе
  toggleCheckboxes() {
    const content = this.editor.getMdValue(); // Получаем текущее содержимое редактора (Markdown)
    const lines = content.split("\n"); // Разбиваем текст на строки

    // Обрабатываем каждую строку, чтобы переключить чекбоксы
    const updatedLines = lines.map((line) => {
      if (line.startsWith("- [ ]") || line.startsWith("- [x]")) {
        return this.handleCheckboxClick(line); // Переключаем состояние чекбоксов
      }
      return line; // Оставляем строку без изменений, если нет чекбокса
    });

    // Обновляем содержимое редактора с новыми строками
    this.editor.setText(updatedLines.join("\n"));
  }

  render() {
    return (
      <div>
        {/* Кнопка для добавления новой задачи */}
        <span
          className="button button-type-todolist"
          title="Add To-Do Task"
          onClick={this.handleClick}
        >
          Add To-Do
        </span>

        {/* Кнопка для переключения состояний всех чекбоксов */}
        <button onClick={this.toggleCheckboxes}>Toggle Checkboxes</button>
      </div>
    );
  }
}
