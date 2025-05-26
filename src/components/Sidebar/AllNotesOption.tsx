import React, { useContext } from "react";
import { Note } from "@mui/icons-material";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { flexCenter } from "../../styles/mixins";
import { UIContext } from "../../context/UIContext";

interface ContainerProps {
  $active: boolean;
}

const AllNotesOption = ({ $active }: ContainerProps) => {
  const { toggleSidebar } = useContext(UIContext);

  return (
    <Link to="/" onClick={toggleSidebar}>
    </Link>
  );
};

export default AllNotesOption;


