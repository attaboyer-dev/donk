import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import React from "react";

interface TableInfoDialogProps {
  open: boolean;
  onClose: () => void;
  tableValue: any;
}

const TableInfoDialog: React.FC<TableInfoDialogProps> = ({ open, onClose, tableValue }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>Table Information</DialogTitle>
      <DialogContent sx={{ py: 1 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6" component="div" sx={{ mb: 0.5 }}>
            {tableValue.name}
          </Typography>
          <Typography variant="body2">Small Blind: {tableValue.sbSize}</Typography>
          <Typography variant="body2">Big Blind: {tableValue.bbSize}</Typography>
          <Typography variant="body2">Min Buy-In: {tableValue.minBuyIn}</Typography>
          <Typography variant="body2">Max Buy-In: {tableValue.maxBuyIn}</Typography>
          <Typography variant="body2">Game Type: {tableValue.gameType}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableInfoDialog;
