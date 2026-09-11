// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, MenuItem, TextField, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../../utils';
import { Check, CopyAll, TaskAlt, WarningAmber } from '@mui/icons-material';
import { BaseDomain } from '../../../types/domains';
import { createDkimKeypair } from '../../../actions/domains';
import { useAppDispatch } from '../../../store';
import Feedback from '../../../components/Feedback';


const useStyles = makeStyles()((theme: Theme) => ({
  flexRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
  },
  divider: {
    margin: theme.spacing(2, 0, 1, 0),
  },
  result: {
    marginBottom: 16,
  },
  manual: {
    border: `1px dashed ${theme.palette.warning.main}`,
    borderRadius: 4,
    marginTop: 8,
    padding: 16,
  },
  commands: {
    background: theme.palette.mode === "light" ? "#fff" : "#000",
    color: theme.palette.mode === "light" ? "#000" : "#fff",
    fontSize: 16,
    padding: 16,
    borderRadius: 8,
  }
}));

interface GenerateDkimKeysProps {
  open: boolean;
  onClose: () => void;
  domain: BaseDomain,
}

const commands = (domain: string) => `
postconf -e 'non_smtpd_milters = $smtpd_milters'
mkdir -m 0700 /var/lib/grommunio-antispam/dkim
cp /var/lib/grommunio-admin-api/${domain}.dkim.key /var/lib/grommunio-antispam/dkim/
chown -Rf groas:grommunio /var/lib/grommunio-antispam/dkim
chmod 600 /var/lib/grommunio-antispam/dkim/${domain}.dkim.key
systemctl restart postfix
`;

function GenerateDkimKeys({ open, onClose, domain }: GenerateDkimKeysProps) {
  const dispatch = useAppDispatch();
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [pubKey, setPubkey] = useState("");
  const [type, setType] = useState("rsa");
  const [mode, setMode] = useState("dns");
  const [selector, setSelector] = useState("");
  const [loading, setLoading] = useState(false);
  const [redisStored, setRedisStored] = useState(true);
  const [keyCopied, setKeyCopied] = useState(false);
  const [commandsCopied, setCommandsCopied] = useState(false);
  const [snackbar, setSnackbar] = useState("");

  const handleKeygen = async () => {
    setKeyCopied(false);
    setLoading(true);
    const response = await dispatch(createDkimKeypair(domain.ID, { type, mode, selector: selector || undefined }))
      .catch((err) => setSnackbar(err));
    // Newer backends return {pubKey, redisStored, redisError}; older ones
    // return the bare public key and always require manual installation.
    setPubkey(typeof response === "string" ? response : (response?.pubKey ?? ""));
    setRedisStored(typeof response === "object" && response !== null ? Boolean(response.redisStored) : false);
    setLoading(false);
  }

  const handleCopy = (type: string) => async () => {
    if(!pubKey) return;
    const success = await copyToClipboard(type === "key" ? pubKey : commands(domain.domainname));
    if(success) {
      if(type === "key") setKeyCopied(true);
      else setCommandsCopied(true);
    }
  }

  const handleClose = () => {
    onClose();
    setPubkey("");
    setKeyCopied(false);
    setCommandsCopied(false);
    setLoading(false);
    setType("rsa");
    setSelector("");
    setMode("dns");
  }

  return (
    <Dialog open={open} maxWidth="md" onClose={handleClose}>
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
            label={t("Output mode")}
            value={mode}
            onChange={e => setMode(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
            select
          >
            <MenuItem value="dns">dns</MenuItem>
            <MenuItem value="dnskey">dnskey</MenuItem>
            <MenuItem value="plain">plain</MenuItem>
          </TextField>
          <TextField
            label={t("selector")}
            value={selector}
            onChange={e => setSelector(e.target.value)}
            placeholder='dkim'
            fullWidth
            sx={{ my: 1 }}
            helperText={t("default") + ": 'dkim'"}
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
        {pubKey && <Typography sx={{ mb: 0.5, fontWeight: 700 }}>Public key:</Typography>}
        <pre>
          {pubKey}
        </pre>
        {!!pubKey && <Button
          onClick={handleCopy("key")}
          variant='contained'
          size='small'
          sx={{ mt: 2, mb: 2 }}
          startIcon={keyCopied ? <Check /> : <CopyAll />}
        >
          {t(keyCopied ? "Copied" : "Copy key")}
        </Button>}
        {!!pubKey && redisStored && <div className={classes.manual}>
          <div className={classes.flexRow}>
            <TaskAlt color='success' sx={{ mr: 2 }}/>
            <Typography variant='h6'>
              {t("The key has been installed on the server")}
            </Typography>
          </div>
          <Typography sx={{ mb: 1 }}>
            {t("The private key was pushed to the DKIM keystore and is used for signing automatically")}.
          </Typography>
        </div>}
        {!!pubKey && !redisStored && <div className={classes.manual}>
          <div className={classes.flexRow}>
            <WarningAmber color='warning' sx={{ mr: 2 }}/>
            <Typography variant='h6' color='warning'>
              {t("Additional configuration required")}
            </Typography>
          </div>
          <Typography sx={{ mb: 1, fontWeight: "bold" }}>
            {t("The private key has been generated on the server")}.{" "}
            {t("Because the API could not store it in the DKIM keystore, you need to make additional changes on the server manually")}:
          </Typography>
          <div className={classes.commands}>
            <pre>
              postconf -e &apos;non_smtpd_milters = $smtpd_milters&apos;
            </pre>
            <pre>
              mkdir -m 0700 /var/lib/grommunio-antispam/dkim
            </pre>
            <pre>
              cp /var/lib/grommunio-admin-api/{domain.domainname}.dkim.key /var/lib/grommunio-antispam/dkim/
            </pre>
            <pre>
              chown -Rf groas:grommunio /var/lib/grommunio-antispam/dkim
            </pre>
            <pre>
              chmod 600 /var/lib/grommunio-antispam/dkim/{domain.domainname}.dkim.key
            </pre>
            <pre>
              systemctl restart postfix
            </pre>
          </div>
          <Button
            onClick={handleCopy("commands")}
            variant='contained'
            size='small'
            sx={{ mt: 2, mb: 2 }}
            startIcon={commandsCopied ? <Check /> : <CopyAll />}
          >
            {t(commandsCopied ? "Copied" : "Copy commands")}
          </Button>
        </div>}
      </DialogContent>
      <Feedback
        snackbar={snackbar}
        onClose={() => setSnackbar("")}
      />
    </Dialog>
  );
}


export default GenerateDkimKeys;