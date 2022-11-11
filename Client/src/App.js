import React from "react";
import { styled } from "@mui/material/styles";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Table from "./Table";
import axios from "axios";
// import fetch from "fetch";
import { Button } from "@mui/material";

function App() {
  const [data, setData] = React.useState({});
  const [showTable, setShowTable] = React.useState(false);
  const handleClick = async () => {
    axios
      .get("http://localhost:6000/")
      .then(async (response) => {
        setData(response.data);
        setShowTable(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <React.Fragment>
      {!showTable ? (
        <Button
          variant="contained"
          onClick={handleClick}
          sx={{ marginLeft: 70, marginTop: 10 }}
        > Click Here to Show Table
        </Button>
      ) : (
        ""
      )}
      {showTable ? <Table data={data} /> : ""}
    </React.Fragment>
  );
}

export default App;
