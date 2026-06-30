// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, MenuItem, TextField, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { dkimKeygen } from '../../../api';
import { copyToClipboard } from '../../../utils';
import { Check, CopyAll } from '@mui/icons-material';
import { BaseDomain } from '@/types/domains';


const useStyles = makeStyles()((theme: Theme) => ({
  divider: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  result: {
    marginBottom: 16,
  },
}));

interface GenerateDkimKeysProps {
  open: boolean;
  onClose: () => void;
  domain: BaseDomain,
}

function GenerateDkimKeys({ open, onClose, domain }: GenerateDkimKeysProps) {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [pubKey, setPubkey] = useState("");
  const [type, setType] = useState("rsa");
  const [selector, setSelector] = useState("");
  const [loading, setLoading] = useState(false);
  const [successfullCopied, setSuccessfullyCopied] = useState(false);

  const handleKeygen = async () => {
    setSuccessfullyCopied(false);
    setLoading(true);
    const key = await dkimKeygen(domain.ID, { type, selector: selector || undefined });
    setPubkey(key);
    setLoading(false);
  }

  const handleCopy = async () => {
    if(!pubKey) return;
    const success = await copyToClipboard(pubKey);
    if(success) {
      setSuccessfullyCopied(true);
    }
  }

  const handleClose = () => {
    onClose();
    setPubkey("");
    setSuccessfullyCopied(false);
    setLoading(false);
    setType("rsa");
    setSelector("");
  }

  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={handleClose}>
      <DialogTitle>{t("Generate DKIM keypair")}</DialogTitle>
      <DialogContent>
        <div style={{ marginTop: 8 }}>
          <TextField
            label={t("Type")}
            value={type}
            onChange={e => setType(e.target.value)}
            fullWidth
            select
          >
            <MenuItem value="rsa">rsa</MenuItem>
            <MenuItem value="ed25519">ed25519</MenuItem>
          </TextField>
          <TextField
            label={t("selector")}
            value={selector}
            onChange={e => setSelector(e.target.value)}
            placeholder='dkim'
            fullWidth
            sx={{ my: 1 }}
            helperText="default: 'dkim'"
          />
          <div style={{ display: "flex" }}>
            <Button
              onClick={handleKeygen}
              variant='contained'
              size='small'
              sx={{ ml: 1, flex: 1 }}
            >
              {loading ? <CircularProgress size={24}/> : t('Generate')}
            </Button>
          </div>
        </div>
        <Divider className={classes.divider}/>
        <pre>
          {pubKey}
        </pre>
        {!!pubKey && <Button
          onClick={handleCopy}
          variant='contained'
          size='small'
          sx={{ mt: 2 }}
          startIcon={successfullCopied ? <Check /> : <CopyAll />}
        >
          {t(successfullCopied ? "Copied" : "Copy to clipboard")}
        </Button>}
        {pubKey && <Typography sx={{ mt: 1 }}>
          The private key has been generated on the server at
          <pre>/var/lib/grommunio-admin-api/{domain.domainname}.dkim.key</pre>
        </Typography>}
      </DialogContent>
    </Dialog>
  );
}


export default GenerateDkimKeys;