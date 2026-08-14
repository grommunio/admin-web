// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, MenuItem, TextField, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { dkimKeygen } from '../../../api';
import { copyToClipboard } from '../../../utils';
import { Check, CopyAll, WarningAmber } from '@mui/icons-material';
import { BaseDomain } from '@/types/domains';


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
  const { classes } = useStyles();
  const { t } = useTranslation();
  const [pubKey, setPubkey] = useState("");
  const [type, setType] = useState("rsa");
  const [selector, setSelector] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [commandsCopied, setCommandsCopied] = useState(false);

  const handleKeygen = async () => {
    setKeyCopied(false);
    setLoading(true);
    const key = await dkimKeygen(domain.ID, { type, selector: selector || undefined });
    setPubkey(key);
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
        {!!pubKey && <div className={classes.manual}>
          <div className={classes.flexRow}>
            <WarningAmber color='warning' sx={{ mr: 2 }}/>
            <Typography variant='h6' color='warning'>
              {t("Additional configuration required")}
            </Typography>
          </div>
          <Typography sx={{ mb: 1, fontWeight: "bold" }}>
            {t("The private key has been generated on the server")}.{" "}
            {t("Because the API cannot write to the grommunio-antispam directory, you need to make additional changes on the server manually")}:
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
    </Dialog>
  );
}


export default GenerateDkimKeys;