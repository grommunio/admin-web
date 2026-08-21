import React from "react";
import { Grid2, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Checkbox } from "@mui/material";
import { t } from "i18next";
import { ChangeEvent } from "@/types/common";
import { makeStyles } from "tss-react/mui";
import { FOLDER_PERMISSION_TYPES } from "../constants";


const useStyles = makeStyles()(() => ({
  form: {
    width: '100%',
  },
  radio: {
    padding: '2px 9px',
  },
}));


interface IPermissionsGridProps {
  permissions: number;
  setPermissions: (bitmask: number) => void;
  isCalendarFolder: boolean;
}


const PermissionsGrid = ({ permissions, setPermissions, isCalendarFolder }: IPermissionsGridProps) => {
  const { classes } = useStyles();

  const handlePermissions = (e: ChangeEvent) => {
    const value = parseInt(e.target.value); // Input value (1 bit is 1, rest 0)
    const mask = permissions ^ (value || 1); // Toggle nth bit or at least the 0th
    setPermissions(mask);
  }
  
  const handleRadioPermissions = (e: ChangeEvent) => {
    const { value } = e.target;
    let mask = permissions;
    const intValue = parseInt(value);
    const COMBINED_DELETE_RIGHTS = FOLDER_PERMISSION_TYPES.deleteowned | FOLDER_PERMISSION_TYPES.deleteany;
    switch (intValue) {
    case FOLDER_PERMISSION_TYPES.deleteowned: {
      mask = mask & ~(COMBINED_DELETE_RIGHTS) ^ intValue; // Set delete own right bit
      break;
    }
    case COMBINED_DELETE_RIGHTS: {
      // Set own and any delete right bits
      mask = (mask | (COMBINED_DELETE_RIGHTS));
      break;
    }
    default:
      mask &= ~(COMBINED_DELETE_RIGHTS); // Remove own and any delete right bits
      break;
    }
    setPermissions(mask);
  }

  const readPermissionRadioValue = () => {
    if(!isCalendarFolder) {
      if(permissions & FOLDER_PERMISSION_TYPES.readany) return FOLDER_PERMISSION_TYPES.readany;
      return 0; 
    }

    if(permissions & FOLDER_PERMISSION_TYPES.readany) return FOLDER_PERMISSION_TYPES.readany;
    if(permissions & FOLDER_PERMISSION_TYPES.freebusydetailed) return FOLDER_PERMISSION_TYPES.freebusydetailed;
    if(permissions & FOLDER_PERMISSION_TYPES.freebusysimple) return FOLDER_PERMISSION_TYPES.freebusysimple;
    return 0;
  };

  const handleReadPermissions = (e: ChangeEvent) => {
    const { value } = e.target;
    const intValue = parseInt(value);
    let mask = permissions;
    const COMBINED_DELETE_RIGHTS = FOLDER_PERMISSION_TYPES.freebusysimple | FOLDER_PERMISSION_TYPES.freebusydetailed | FOLDER_PERMISSION_TYPES.readany;

    mask = mask & ~(COMBINED_DELETE_RIGHTS) ^ intValue; // XOR options

    setPermissions(mask);
  }

  return <>
    <Grid2 container>
      <Grid2 size={6}>
        <FormControl className={classes.form}>
          <FormLabel focused={false}>{t("Read")}</FormLabel>
          <RadioGroup
            value={readPermissionRadioValue() || 0}
            onChange={handleReadPermissions}>
            <FormControlLabel
              value={0x0}
              control={<Radio size="small" className={classes.radio}/>}
              label={t("None")}
            />
            {isCalendarFolder && <FormControlLabel
              value={FOLDER_PERMISSION_TYPES.freebusysimple}
              control={<Radio size="small" className={classes.radio}/>}
              label={t("Free-busy simple")}
            />}
            {isCalendarFolder && <FormControlLabel
              value={FOLDER_PERMISSION_TYPES.freebusydetailed}
              control={<Radio size="small" className={classes.radio}/>}
              label={t("Free-busy detailed")}
            />}
            <FormControlLabel
              value={FOLDER_PERMISSION_TYPES.readany}
              control={<Radio size="small" className={classes.radio}/>}
              label={t("Full details")}
            />
          </RadioGroup>
        </FormControl>
      </Grid2>
      <Grid2 size={6}>
        <FormControl className={classes.form}>
          <FormLabel>{t("Write")}</FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                value={FOLDER_PERMISSION_TYPES.create}
                checked={Boolean(permissions & FOLDER_PERMISSION_TYPES.create)}
                onChange={handlePermissions}
                className={classes.radio}
                color="primary"
              />
            }
            label={t('Create items')}
          />
          <FormControlLabel
            control={
              <Checkbox
                value={FOLDER_PERMISSION_TYPES.createsubfolder}
                checked={Boolean(permissions & FOLDER_PERMISSION_TYPES.createsubfolder)}
                className={classes.radio}
                onChange={handlePermissions}
                color="primary"
              />
            }
            label={t('Create subfolders')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(permissions & FOLDER_PERMISSION_TYPES.editowned)}
                value={FOLDER_PERMISSION_TYPES.editowned}
                className={classes.radio}
                onChange={handlePermissions}
                color="primary"
              />
            }
            label={t('Edit own')}
          />
          <FormControlLabel
            control={
              <Checkbox
                className={classes.radio}
                checked={Boolean(permissions & FOLDER_PERMISSION_TYPES.editany)}
                value={FOLDER_PERMISSION_TYPES.editany}
                onChange={handlePermissions}
                color="primary"
              />
            }
            label={t('Edit all')}
          />
        </FormControl>
      </Grid2>
    </Grid2>
    <Grid2 container style={{ marginTop: 16 }}>
      <Grid2 size={6}>
        <FormControl className={classes.form}>
          <FormLabel focused={false}>{t("Delete items")}</FormLabel>
          <RadioGroup
            value={(permissions & (FOLDER_PERMISSION_TYPES.deleteowned | FOLDER_PERMISSION_TYPES.deleteany)) || true /* This is a bit janky */}
            defaultValue={true}
            onChange={handleRadioPermissions}
          >
            <FormControlLabel
              value={(permissions & (FOLDER_PERMISSION_TYPES.deleteowned | FOLDER_PERMISSION_TYPES.deleteany)) === 0} // Has explicit handling
              control={<Radio size="small" className={classes.radio}/>}
              label={t("None")} />
            <FormControlLabel
              value={FOLDER_PERMISSION_TYPES.deleteowned}
              control={<Radio size="small" className={classes.radio}/>}
              label={t("Own")}
            />
            <FormControlLabel
              value={(FOLDER_PERMISSION_TYPES.deleteowned | FOLDER_PERMISSION_TYPES.deleteany)}
              control={<Radio size="small" className={classes.radio}/>}
              label={t("All")}
            />
          </RadioGroup>
        </FormControl>
      </Grid2>
      <Grid2 size={6}>
        <FormControl className={classes.form}>
          <FormLabel>{t("Other")}</FormLabel>
          <FormControlLabel
            control={
              <Checkbox
                className={classes.radio}
                checked={Boolean(permissions & FOLDER_PERMISSION_TYPES.folderowner)}
                value={FOLDER_PERMISSION_TYPES.folderowner}
                onChange={handlePermissions}
                color="primary"
              />
            }
            label={t('Folder owner')}
          />
          <FormControlLabel
            control={
              <Checkbox
                className={classes.radio}
                checked={Boolean(permissions & FOLDER_PERMISSION_TYPES.foldercontact)}
                onChange={handlePermissions}
                color="primary"
                value={FOLDER_PERMISSION_TYPES.foldercontact}
              />
            }
            label={t('Folder contact')}
          />
          <FormControlLabel
            control={
              <Checkbox
                className={classes.radio}
                checked={Boolean(permissions & FOLDER_PERMISSION_TYPES.foldervisible)}
                onChange={handlePermissions}
                color="primary"
                value={FOLDER_PERMISSION_TYPES.foldervisible}
              />
            }
            label={t('Folder visible')}
          />
        </FormControl>
      </Grid2>
    </Grid2></>;
}


export default PermissionsGrid;
