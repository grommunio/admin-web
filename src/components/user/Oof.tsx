// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useEffect, useState } from 'react';
import { Button, FormControl, Grid2, MenuItem, Tab, Tabs, TextField, Theme, useTheme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from 'react-i18next';
import { fetchUserOof, setUserOof } from '../../actions/users';
import CustomDateTimePicker from '../CustomDateTimePicker';
import Feedback from '../Feedback';
import moment, { Moment } from 'moment';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router';
import OofEditor from './OofEditor';
import { useAppDispatch } from '../../store';
import { OofSettings } from '@/types/users';
import { ChangeEvent } from '@/types/common';


const useStyles = makeStyles()((theme: Theme) => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    margin: theme.spacing(1),
  },
  headline: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  gridItem: {
    display: 'flex',
  },
  divider: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  flexRow: {
    display: 'flex',
    margin: theme.spacing(1, 0),
  },
  tabs: {
    margin: theme.spacing(1),
  },
  mail: {
    margin: theme.spacing(1, 0),
  },
  editor: {
    backgroundColor: '#f0f !important',
  },
}));


type OofProps = {
  domainID: number;
  userID: number;
}

type OofState = OofSettings & {
  tab: number;
  snackbar: string;
  startTime: Moment | null;
  endTime: Moment | null;
}

const Oof = ({ domainID, userID }: OofProps) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [oof, setOof] = useState<OofState>({
    state: 0,
    externalAudience: 0,
    startTime: null,
    endTime: null,
    internalSubject: "",
    internalReply: "",
    externalSubject: "",
    externalReply: "",
    tab: 0,
    snackbar: '',
  });
  const navigate = useNavigate();
  const theme = useTheme();
  const [tinyRef, setRef] = useState<any>(null);
  const [tinyRef2, setRef2] = useState<any>(null);

  const fetchOof = async (domainID: number, userID: number) => 
    await dispatch(fetchUserOof(domainID, userID))
  const patchOof = async (domainID: number, userID: number, oofSettings: OofSettings) => 
    await dispatch(setUserOof(domainID, userID, oofSettings));

  useEffect(() => {
    const fetchData = async () => {
      const oofData = await fetchOof(domainID, userID)
        .catch(message => setOof({ ...oof, snackbar: message || 'Unknown error' }));
      if(oofData.startTime) {
        oofData.startTime = moment(oofData.startTime);
      }
      if(oofData.endTime) {
        oofData.endTime = moment(oofData.endTime);
      }
      setOof({
        ...oof,
        ...(oofData || {}),
      })
    }

    fetchData();
  }, []);

  const oofStates = [
    { value: 0, label: 'Disabled' },
    { value: 1, label: 'Enabled' },
    { value: 2, label: 'Scheduled' },
  ]

  const externalAudiences = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Known' },
    { value: 2, label: 'All' },
  ]

  const handleInput = (field: keyof OofState) => (e: ChangeEvent) => {
    setOof({ ...oof, [field]: e.target.value });
  }

  const handleDateInput = (field: "startTime" | "endTime") => (newVal: Moment | null) => {
    setOof({ ...oof, [field]: newVal });
  }

  const handleTabChange = (_: any, tab: number) => setOof({ ...oof, tab });

  const handleSave = () => {
    const { state, externalAudience, startTime, endTime, internalSubject, externalSubject, internalReply, externalReply } = oof;

    patchOof(domainID, userID, {
      ...oof,
      state,
      externalAudience,
      // Only send dates when oof is scheduled
      startTime: [0, 1].includes(state) || !startTime ? undefined : startTime.format('YYYY-MM-DD HH:mm') + ':00',
      endTime: [0, 1].includes(state) || !endTime ? undefined : endTime.format('YYYY-MM-DD HH:mm') + ':00',
      internalSubject: internalSubject,
      internalReply: tinyRef?.current ? DOMPurify.sanitize(tinyRef?.current.getContent()) : internalReply,
      externalSubject: externalSubject,
      externalReply: tinyRef2?.current ? DOMPurify.sanitize(tinyRef2?.current.getContent()) : externalReply,
    })
      .then(() => setOof({ ...oof, snackbar: 'Success!' }))
      .catch(message => setOof({ ...oof, snackbar: message || 'Unknown error' }));
  }

  const { tab, startTime, endTime, snackbar, internalReply, externalReply } = oof;

  const tfProps = (label: string, field: keyof OofState) => ({
    fullWidth: true,
    label: t(label),
    value: oof[field],
    onChange: handleInput(field),
  });

  const datepickerProps = (label: string, field: keyof OofState) => ({
    ...tfProps(label, field),
    value: moment(oof[field]),
  });

  return (<>
    <FormControl className={classes.form}>
      <div className={classes.flexRow}>
        <TextField
          {...tfProps("State ", "state")}
          select
          className={classes.input}
          disabled={false}
        >
          {oofStates.map((status, key) => (
            <MenuItem key={key} value={status.value}>
              {t(status.label)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...tfProps("External audience", "externalAudience")}
          select
          className={classes.input}
          disabled={false}
        >
          {externalAudiences.map((audience, key) => (
            <MenuItem key={key} value={audience.value}>
              {t(audience.label)}
            </MenuItem>
          ))}
        </TextField>
        <CustomDateTimePicker
          {...datepickerProps("Start time", "startTime")}
          onChange={handleDateInput('startTime')}
          sx={{
            margin: theme.spacing(1),
            minWidth: 200,
          }}
        />
        <CustomDateTimePicker
          {...datepickerProps("End time", "endTime")}
          onChange={handleDateInput('endTime')}
          sx={{
            margin: theme.spacing(1),
            minWidth: 200,
          }}
        />
      </div>
      <Tabs
        indicatorColor="primary"
        value={tab}
        onChange={handleTabChange}
        className={classes.tabs}
      >
        <Tab label={t("Inside my organization")} />
        <Tab label={t("Outside my organization")} />
      </Tabs>
      <div className={classes.tabs} style={{ display: tab === 0 ? "block" : "none"}}>
        <TextField 
          {...tfProps("Internal subject", "internalSubject")}
          className={classes.mail}
        />
        <div className={classes.mail}>
          <OofEditor setRef={setRef} initialValue={internalReply}/>
        </div>
      </div>
      <div className={classes.tabs} style={{ display: tab === 1 ? "block" : "none"}}>
        <TextField
          {...tfProps("External subject", "externalSubject")}
          className={classes.mail}
        />
        <div className={classes.mail}>
          <OofEditor setRef={setRef2} initialValue={externalReply}/>
        </div>
      </div>
    </FormControl>
    <Grid2 container>
      <Button
        onClick={() => navigate(-1)}
        style={{ marginRight: 8 }}
        color="secondary"
      >
        {t('Back')}
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={Boolean(startTime && moment(startTime).isAfter(endTime))}
      >
        {t('Save')}
      </Button>
    </Grid2>
    <Feedback
      snackbar={snackbar}
      onClose={() => setOof({ ...oof, snackbar: '' })}
    />
  </>
  );
}


export default Oof;
