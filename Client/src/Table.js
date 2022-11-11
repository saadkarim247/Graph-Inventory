import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function createData(name, calories, fat, carbs, protein, workweek3, workweek4) {
  return { name, calories, fat, carbs, protein,  workweek3, workweek4 };
}

const rows = [
  createData('AD', 2, 5, 2, 4, 8, 12),
  createData('AD', 2, 5, 2, 4, 8, 12),
  createData('AD', 2, 5, 2, 4, 8, 12),
  createData('AD', 2, 5, 2, 4, 8, 12),
  createData('AD', 2, 5, 2, 4, 8, 12),
];

function TableGraph(props) {
  const data = props.data;
  return (
    <TableContainer component={Paper} sx={{padding: 10}}>
      <Table sx={{ minWidth: 400, maxWidth: 1200}} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Part Number</StyledTableCell>
            <StyledTableCell align="right">BOM Required Qty</StyledTableCell>
            <StyledTableCell align="right">Inventory</StyledTableCell>
            <StyledTableCell align="right">Work Week 1</StyledTableCell>
            <StyledTableCell align="right">Work Week 2</StyledTableCell>
            <StyledTableCell align="right">Work Week 3</StyledTableCell>
            <StyledTableCell align="right">Work Week 4</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <StyledTableRow key={item.PartNumber}>
              <StyledTableCell component="th" scope="row">
                {item.PartNumber}
              </StyledTableCell>
              <StyledTableCell align="right">{item.BOM_REQ_RTY}</StyledTableCell>
              <StyledTableCell align="right">{item.Inventory}</StyledTableCell>
              <StyledTableCell align="right">{item.Work_Week1}</StyledTableCell>
              <StyledTableCell align="right">{item.Work_Week2}</StyledTableCell>
              <StyledTableCell align="right">{item.Work_Week3}</StyledTableCell>
              <StyledTableCell align="right">{item.Work_Week4}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TableGraph;
