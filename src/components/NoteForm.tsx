import React, { useState } from "react";

type NoteFormProps = {
  onSubmit: (noteData: {
    name: string;
    text: string;
    color: string;
    media: string;
    order: number;
    is_deleted: boolean;
  }) => void;
};

export default function NoteForm({ onSubmit }: NoteFormProps) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [color, setColor] = useState("blue");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    onSubmit({
      name,
      text,
      color,
      media: "",
      order: 0,
      is_deleted: false,
    });

    setName("");
    setText("");
    setColor("blue");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 p-4 border rounded bg-white"
    >
      <input
        className="w-full border px-2 py-1 rounded"
        type="text"
        placeholder="Название заметки"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        className="w-full border px-2 py-1 rounded"
        placeholder="Текст заметки"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <select
        className="w-full border px-2 py-1 rounded"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      >
        <option value="blue">Синий</option>
        <option value="red">Красный</option>
        <option value="green">Зелёный</option>
        <option value="purple">Фиолетовый</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Добавить заметку
      </button>
    </form>
  );
}
