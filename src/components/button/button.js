import React from 'react';
import {Button, CircularProgress} from "@mui/material";


export default function LoadingButton({ loading, children, ...rest }) {
  return (
    <span>
      <Button disabled={loading} {...rest}>
        {children} {loading ? <CircularProgress size={13} style={{position: 'relative', left: '5px'}} /> : null}
      </Button>
    </span>
  );
}