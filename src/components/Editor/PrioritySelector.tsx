import styled from "styled-components";

const SmallSelect = styled.select`
  font-size: 12px; /* Уменьшаем шрифт */
  padding: 4px 8px; /* Меньшие отступы */
  border-radius: 5px; /* Округленные углы */
  border: 1px solid #ccc; /* Тонкая рамка */
  background-color: #f9f9f9; /* Цвет фона */
  cursor: pointer;
  outline: none;

  /* Для улучшения внешнего вида */
  &:hover {
    border-color: #888;
  }

  &:focus {
    border-color: #3951b5;
  }
`;

const SmallSelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrioritySelector = ({
  priority,
  onPriorityChange,
}: {
  priority: number;
  onPriorityChange: (newPriority: number) => void;
}) => {
  return (
    <SmallSelectWrapper>
      <SmallSelect
        id="priority"
        value={priority}
        onChange={(e) => onPriorityChange(Number(e.target.value))} // Обновление приоритета при изменении значения
      >
        <option value={4}>Высокий</option>
        <option value={3}>Средний</option>
        <option value={2}>Низкий</option>
        <option value={1}>Нет приоритета</option>
      </SmallSelect>
    </SmallSelectWrapper>
  );
};

export default PrioritySelector;
