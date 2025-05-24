import React, { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import styled from "styled-components";

const Timestamp = styled.span`
  font-size: 14px;
  color: gray;
`;

interface Props {
  date: Date;
}

const AutoUpdatingTimeAgo: React.FC<Props> = ({ date }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000); // обновляем каждую минуту

    return () => clearInterval(interval);
  }, []);

  return (
    <Timestamp>
      {formatDistanceToNow(date, { locale: ru, addSuffix: true })}
    </Timestamp>
  );
};

export default AutoUpdatingTimeAgo;
