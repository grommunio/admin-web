// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2026 grommunio GmbH
//
// SmtpGateway.tsx — per-domain SMTP gateway configuration panel.
//
// Embedded as a fourth tab in DomainDetails. Reads and writes
// /api/v1/domains/<id>/smtpGateway. The backend stores the data
// in the `domain_smtp_gateway` MySQL table; gromox reads the
// same table at SMTP delivery time and selects the right outgoing
// URL per sender domain.
//
// The component is "controlled" — it only renders the form fields
// and the data buffer, and exposes that buffer to the parent
// (DomainDetails) via an imperative handle (forwardRef/
// useImperativeHandle). The parent's existing Save button drives
// persistence, exactly like the Disabled plugins tab.

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

import { useParams } from 'react-router';

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  description: {
    marginBottom: theme.spacing(2),
  },
  row: {
    marginTop: theme.spacing(2),
  },
  lastRow: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
}));

export type SmtpGatewayData = {
  host: string;
  port: number;
  encryption: 'none' | 'starttls' | 'starttls_unverified' | 'tls';
  username: string;
  password: string;
  passwordSet: boolean;
  fromAddress: string;
  enabled: boolean;
  description: string;
};

const EMPTY: SmtpGatewayData = {
  host: '',
  port: 25,
  encryption: 'none',
  username: '',
  password: '',
  passwordSet: false,
  fromAddress: '',
  enabled: true,
  description: '',
};

export type SmtpGatewayHandle = {
  /** Returns the current data buffer; the parent uses this when
   *  its own Save button is clicked.  The buffer always contains
   *  the latest typed values, even if the user did not click
   *  "Save" inside the tab first. */
  getData: () => SmtpGatewayData;
};

const SmtpGateway = forwardRef<SmtpGatewayHandle>((_props, ref) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { domainID } = useParams();

  const [data, setData] = useState<SmtpGatewayData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = Number(domainID);
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const r = await fetch(`/api/v1/domains/${id}/smtpGateway`, {
          headers: { 'Accept': 'application/json' },
        });
        if (r.status === 404) {
          setData(EMPTY);
        } else if (!r.ok) {
          setError(`${t("Failed to load")} (${r.status})`);
        } else {
          const body = await r.json();
          if (body.data) {
            setData({ ...EMPTY, ...body.data });
          } else {
            setData(EMPTY);
          }
        }
      } catch (e: any) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [domainID, t]);

  const update = <K extends keyof SmtpGatewayData>(k: K, v: SmtpGatewayData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  useImperativeHandle(ref, () => ({
    getData: () => {
      // Don't send the password back unless it was edited.
      const payload: any = { ...data };
      if (!data.password) delete payload.password;
      return payload;
    },
  }), [data]);

  if (loading) {
    return <div>{t("Loading…")}</div>;
  }

  return (
    <div className={classes.root}>
      <Typography variant="body2" color="textSecondary" className={classes.description}>
        {t("Route outgoing mail from this domain through a specific SMTP server. "
          + "Leave empty to use the global default.")}
      </Typography>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      <TextField
        fullWidth
        label={t("Host")}
        value={data.host}
        onChange={(e) => update('host', e.target.value)}
        placeholder="smtp.example.com"
        required
        className={classes.row}
      />

      <TextField
        fullWidth
        type="number"
        label={t("Port")}
        value={data.port}
        onChange={(e) => update('port', Number(e.target.value) || 25)}
        className={classes.row}
      />

      <FormControl fullWidth className={classes.row}>
        <InputLabel id="enc-label">{t("Encryption")}</InputLabel>
        <Select
          labelId="enc-label"
          label={t("Encryption")}
          value={data.encryption}
          onChange={(e) => update('encryption', e.target.value as any)}
        >
          <MenuItem value="none">{t("None (plain SMTP)")}</MenuItem>
          <MenuItem value="starttls">{t("STARTTLS (verify certificate)")}</MenuItem>
          <MenuItem value="starttls_unverified">{t("STARTTLS (do not verify certificate)")}</MenuItem>
          <MenuItem value="tls">{t("TLS (implicit, port 465)")}</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label={t("From address (envelope sender override)")}
        value={data.fromAddress}
        onChange={(e) => update('fromAddress', e.target.value)}
        placeholder="noreply@example.com"
        className={classes.row}
      />

      <TextField
        fullWidth
        label={t("Username")}
        value={data.username}
        onChange={(e) => update('username', e.target.value)}
        autoComplete="off"
        className={classes.row}
      />

      <TextField
        fullWidth
        type="password"
        label={t("Password") + (data.passwordSet ? ` (${t("set — leave empty to keep")})` : '')}
        value={data.password}
        onChange={(e) => update('password', e.target.value)}
        autoComplete="new-password"
        className={classes.row}
      />

      <TextField
        fullWidth
        label={t("Description")}
        value={data.description}
        onChange={(e) => update('description', e.target.value)}
        className={classes.lastRow}
      />
    </div>
  );
});

SmtpGateway.displayName = 'SmtpGateway';

export default SmtpGateway;
