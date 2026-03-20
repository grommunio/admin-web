// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import { makeStyles } from 'tss-react/mui';
import { Dialog, DialogContent, DialogTitle, Divider, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DNSDialogProps } from './types';


const useStyles = makeStyles()((theme: Theme) => ({
  divider: {
    margin: theme.spacing(2, 0, 1, 0),
  },
}));

function Reachability({ onClose, dnsCheck }: DNSDialogProps) {
  const { classes } = useStyles();
  const { t } = useTranslation();
  return (
    <Dialog open maxWidth="md" fullWidth onClose={onClose}>
      <DialogTitle>{t("Reachability")}</DialogTitle>
      <DialogContent>
        <Typography variant='h6'>{t("Local IP")}: {dnsCheck.localIp || t("Unresolvable")}</Typography>
        <Typography>{t("local_ip_expl")}</Typography>
        <Divider className={classes.divider}/>
        <Typography variant='h6'>{t("External IP")}: {dnsCheck.externalIp || t("Unresolvable")}</Typography>
        <Typography>{t("external_ip_expl")}</Typography>
      </DialogContent>
    </Dialog>
  );
}


export default Reachability;