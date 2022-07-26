// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, FormControl, TextField, Button, DialogActions,
  CircularProgress,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Typography,
  IconButton,
  Autocomplete
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addClassData, fetchClassesData } from '../../actions/classes';
import { Delete } from '@mui/icons-material';
import MagnitudeAutocomplete from '../MagnitudeAutocomplete';

const styles = theme => ({
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  flexTextfield: {
    flex: 1,
    margin: theme.spacing(0, 0.5),
  },
  select: {
    minWidth: 60,
  },
  grid: {
    display: 'flex',
    margin: theme.spacing(1, 1, 1, 1),
  },
  marginTop: {
    marginTop: 8,
  },
});

class AddClass extends PureComponent {

  state = {
    classname: '',
    parentClasses: [],
    members: '',
    filters: [],
    loading: false,
    autocompleteInput: '',
  }

  operators = [
    { label: 'equal', value: 'eq'},
    { label: 'unequal', value: 'ne'},
    { label: 'less than', value: 'lt'},
    { label: 'less or equal', value: 'le'},
    { label: 'greater than', value: 'gt'},
    { label: 'greater or equal', value: 'ge'},
    { label: 'regex match', value: 'li'},
    { label: 'no regex match', value: 'nl'},
    { label: 'exists', value: 'ex'},
    { label: 'does not exist', value: 'nx'},
  ];

  columns = [ 'username' ];

  handleInput = field => event => {
    this.setState({
      [field]: event.target.value,
    });
  }

  handleMemberInput = event => {
    this.setState({
      members: event.target.value,
      filters: [],
    });
  }

  handleAdd = () => {
    const { add, domain } = this.props;
    const { classname, parentClasses, members, filters } = this.state;
    this.setState({ loading: true });
    add(domain.ID, {
      classname,
      parentClasses: parentClasses.map(c => c.ID),
      members: members ? members.replace(/\s/g, "").split(',') : [], // Make array from members separated by commas
      filters,
      autocompleteInput: undefined,
    })
      .then(() => {
        this.setState({
          classname: '',
          parentClasses: [],
          members: '',
          filters: [],
          loading: false,
          autocompleteInput: '',
        });
        this.props.onSuccess();
      })
      .catch(error => {
        this.props.onError(error);
        this.setState({ loading: false });
      });
  }

  handleEnter = () => {
    const { fetch, domain } = this.props;
    fetch(domain.ID)
      .catch(error => {
        this.props.onError(error);
        this.setState({ loading: false });
      });
  }

  handleFilterInput = (ANDidx, ORidx, field) => e => {
    const filters = [...this.state.filters];
    filters[ANDidx][ORidx][field] = e.target.value;
    this.setState({ filters, members: '' });
  }

  handleAutocomplete = (ANDidx, ORidx, field) => (e, newVal) => {
    const filters = [...this.state.filters];
    filters[ANDidx][ORidx][field] = newVal;
    this.setState({ filters });
  }

  handleAuto = (field) => (e, newVal) => {
    this.setState({
      [field]: newVal,
      autocompleteInput: '',
    });
  }

  handleAddAND = () => {
    const filters = [...this.state.filters];
    filters.push([{ prop: '', op: '', val: '' }]);
    this.setState({ filters });
  }

  handleRemoveAND = ANDidx => e => {
    e.stopPropagation();
    const filters = [...this.state.filters];
    filters.splice(ANDidx, 1);
    this.setState({ filters });
  }

  handleAddOR = ANDidx => () => {
    const filters = [...this.state.filters];
    filters[ANDidx].push({ property: '', op: '', val: '' });
    this.setState({ filters });
  }

  handleRemoveOR = (ANDidx, ORidx) => () => {
    const filters = [...this.state.filters];
    filters[ANDidx].splice(ORidx, 1);
    this.setState({ filters });
  }

  render() {
    const { classes, t, open, onClose, _classes } = this.props;
    const { classname, parentClasses, members, filters, loading, autocompleteInput } = this.state;

    return (
      <Dialog
        onClose={onClose}
        open={open}
        maxWidth="md"
        fullWidth
        TransitionProps={{
          onEnter: this.handleEnter,
        }}>
        <DialogTitle>{t('addHeadline', { item: 'Group' })}</DialogTitle>
        <DialogContent style={{ minWidth: 400 }}>
          <FormControl className={classes.form}>
            <TextField 
              className={classes.input} 
              label={t("Groupname")} 
              fullWidth 
              value={classname || ''}
              onChange={this.handleInput('classname')}
              autoFocus
              required
            />
            <MagnitudeAutocomplete
              value={parentClasses || []}
              filterAttribute={'classname'}
              inputValue={autocompleteInput}
              onChange={this.handleAuto('parentClasses')}
              className={classes.input} 
              options={_classes}
              onInputChange={this.handleInput('autocompleteInput')}
              label={t("Parent groups")}
              multiple
            />
            <TextField 
              className={classes.input} 
              label={t("Members (separate by comma)")} 
              fullWidth 
              value={members || ''}
              onChange={this.handleMemberInput}
            />
          </FormControl>
          <div>
            <Typography variant="body1">{t('Filters (All must be true)')}</Typography>
            {filters.map((ANDFilter, ANDidx) =>
              <Accordion
                className={classes.panel}
                elevation={2 /* 1 has global overwrite */}
                key={ANDidx}
                defaultExpanded
              >
                <AccordionSummary>
                  <Grid container justifyContent="space-between">
                    <Typography body="body1">{t('Filter (One must be true)')}</Typography>
                    <IconButton onClick={this.handleRemoveAND(ANDidx)} size="large">
                      <Delete fontSize="small" color="error"/>
                    </IconButton>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container>
                    {ANDFilter.map((ORFilter, ORidx) =>  
                      <Grid item xs={12} key={ORidx} className={classes.grid}>
                        <Autocomplete
                          value={ORFilter.prop || ''}
                          inputValue={ORFilter.prop || ''}
                          onChange={this.handleAutocomplete(ANDidx, ORidx, 'prop')}
                          onInputChange={this.handleFilterInput(ANDidx, ORidx, 'prop')}
                          freeSolo
                          className={classes.flexTextfield} 
                          options={this.columns}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t("Name of property to match")}
                            />
                          )}
                        />
                        <TextField
                          className={classes.flexTextfield} 
                          label={t("Comparison operator")}
                          value={ORFilter.op || ''}
                          onChange={this.handleFilterInput(ANDidx, ORidx, 'op')}
                          select
                        >
                          {this.operators.map(op =>
                            <MenuItem value={op.value} key={op.label}>{op.label}</MenuItem>
                          )}
                        </TextField>
                        <TextField
                          className={classes.flexTextfield} 
                          label={t("Compare value (binary operators)")}
                          value={ORFilter.val || ''}
                          onChange={this.handleFilterInput(ANDidx, ORidx, 'val')}
                        />
                        {filters[ANDidx].length > 1 &&
                        <IconButton onClick={this.handleRemoveOR(ANDidx, ORidx)} size="large">
                          <Delete fontSize="small" color="error"/>
                        </IconButton>}
                      </Grid>
                    )}
                    <Grid container justifyContent="center" className={classes.marginTop}>
                      <Button variant="outlined" onClick={this.handleAddOR(ANDidx)}>{t('Add or-statement')}</Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}
            <Grid container justifyContent="center" className={classes.marginTop}>
              <Button variant="outlined" onClick={this.handleAddAND}>{t('Add and-statement')}</Button>
            </Grid>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onClose}
            color="secondary"
          >
            {t('Cancel')}
          </Button>
          <Button
            onClick={this.handleAdd}
            variant="contained"
            color="primary"
            disabled={loading || !classname}
          >
            {loading ? <CircularProgress size={24}/> : t('Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddClass.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  fetch: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  _classes: PropTypes.array.isRequired,
  domain: PropTypes.object.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { _classes: state._classes.Select };
};

const mapDispatchToProps = dispatch => {
  return {
    add: async (domainID, _class) => {
      await dispatch(addClassData(domainID, _class)).catch(message => Promise.reject(message));
    },
    fetch: async (domainID) => await dispatch(fetchClassesData(domainID, { sort: 'classname,asc' }, true))
      .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(AddClass)));
