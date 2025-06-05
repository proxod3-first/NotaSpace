import React, { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import styled from "styled-components";

const Timestamp = styled.span`
  font-size: 13px;
  color: gray;
  text-align: left;
  display: block;
`;

interface Props {
  date: Date;
}
const AutoUpdatingTimeAgo: React.FC<Props> = ({ date }) => {
  const [timeAgo, setTimeAgo] = useState<string>("");
  const formattedDate = format(date, "dd.MM.yyyy"); // Форматируем текущую дату

  useEffect(() => {
    // Форматируем разницу во времени при монтировании компонента
    const formattedTimeAgo = formatDistanceToNow(date, {
      locale: ru,
      addSuffix: true,
    });
    setTimeAgo(formattedTimeAgo);
  }, [date]); // Зависимость от date, чтобы обновить при изменении даты
  return <Timestamp>{formattedDate}</Timestamp>;
};
export default AutoUpdatingTimeAgo;
