import React from "react";
import { PluginComponent } from "react-markdown-editor-lite";

interface TodoPluginState {
  showMenu: boolean;
}

export default class TodoPlugin extends PluginComponent<TodoPluginState> {
  static pluginName = "todo";
  static align = "left";

  // Определяем icon как статическое свойство класса
  static icon = () => (
    <span
      style={{
        display: "inline-block",
        width: "16px",
        height: "16px",
        border: "2px solid currentColor",
        borderRadius: "3px",
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "3px",
          top: "0",
          width: "6px",
          height: "10px",
          borderRight: "2px solid currentColor",
          borderBottom: "2px solid currentColor",
          transform: "rotate(45deg)",
        }}
      ></span>
    </span>
  );

  constructor(props: any) {
    super(props);
    this.state = { showMenu: false };
  }

  handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    this.setState((prevState) => ({ showMenu: !prevState.showMenu }));
  };

  insertTodo = (checked = false) => {
    const markdown = `- [${checked ? "x" : " "}] `;
    this.editor.insertText(markdown);
    this.setState({ showMenu: false });
  };

  render() {
    // Правильное обращение к статическому свойству
    const Icon = (this.constructor as typeof TodoPlugin).icon;

    // Стиль для hover эффекта
    const menuItemStyle: React.CSSProperties = {
      padding: "8px 12px",
      cursor: "pointer",
    };

    const menuItemHoverStyle: React.CSSProperties = {
      backgroundColor: "#f5f5f5",
    };

    return (
      <div
        className="button-wrap"
        title="ToDo List"
        onClick={this.handleClick}
        style={{
          position: "relative",
          display: "inline-block",
          margin: "0 3px",
        }}
      >
        <button
          className="button"
          style={{
            minWidth: "24px",
            height: "28px",
            color: "#757575",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: this.state.showMenu ? "#e0e0e0" : "transparent",
            border: "none",
            cursor: "pointer",
            borderRadius: "3px",
          }}
        >
          <Icon />
        </button>

        {this.state.showMenu && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 100,
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              padding: "4px 0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              minWidth: "200px",
            }}
          >
            <div
              style={{
                ...menuItemStyle,
                ...(this.state.showMenu ? menuItemHoverStyle : {}),
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f5f5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
              onClick={(e) => {
                e.stopPropagation();
                this.insertTodo(false);
              }}
            >
              Добавить задачу
            </div>
            <div
              style={{
                ...menuItemStyle,
                ...(this.state.showMenu ? menuItemHoverStyle : {}),
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f5f5f5")
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
              onClick={(e) => {
                e.stopPropagation();
                this.insertTodo(true);
              }}
            >
              Добавить выполненную задачу
            </div>
          </div>
        )}
      </div>
    );
  }
}
