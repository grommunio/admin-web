// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2022 grommunio GmbH

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { withTranslation } from 'react-i18next';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  Button,
  MenuItem,
  Accordion,
  AccordionSummary,
  IconButton,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Breadcrumbs,
  Link,
  Autocomplete,
} from '@mui/material';
import { connect } from 'react-redux';
import { editClassData, fetchClassDetails, fetchClassesData } from '../actions/classes';
import { getStringAfterLastSlash } from '../utils';
import { Delete } from '@mui/icons-material';
import { CapabilityContext } from '../CapabilityContext';
import { DOMAIN_ADMIN_WRITE } from '../constants';
import ViewWrapper from '../components/ViewWrapper';
import MagnitudeAutocomplete from '../components/MagnitudeAutocomplete';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
    borderRadius: 6,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  select: {
    minWidth: 60,
  },
  flexTextfield: {
    flex: 1,
    margin: theme.spacing(0, 0.5),
  },
  grid: {
    display: 'flex',
    margin: theme.spacing(1, 1, 1, 1),
  },
  breadcrumbs: {
    marginBottom: 16,
  },
  breadcrumb: {
    cursor: 'pointer',
  },
});

class ClassDetails extends PureComponent {

  state = {
    _class: {},
    stack: [],
    unsaved: false,
    autocompleteInput: '',
    loading: true,
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

  async componentDidMount() {
    const { domain, _classes, fetch, fetchClasses } = this.props;
    if(_classes.length === 0) fetchClasses(domain.ID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    const _class = await fetch(domain.ID, getStringAfterLastSlash())
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      loading: false,
      stack: _class ? [_class] : [],
      _class: _class ? {
        ..._class,
        //parentClasses: _class.parentClasses.map(pc => pc.ID),
        filters: _class.filters || [],
        children: _class.children || [],
      } : {},
    });
  }

  handleInput = field => event => {
    this.setState({
      _class: {
        ...this.state._class,
        [field]: event.target.value,
      },
      unsaved: true,
    });
  }

  handleFilterInput = (ANDidx, ORidx, field) => e => {
    const filters = [...this.state._class.filters];
    filters[ANDidx][ORidx][field] = e.target.value;
    this.setState({ _class: {...this.state._class, filters } });
  }

  handleAutocomplete = (ANDidx, ORidx, field) => (e, newVal) => {
    const filters = [...this.state._class.filters];
    filters[ANDidx][ORidx][field] = newVal;
    this.setState({ _class: {...this.state._class, filters } });
  }

  handleAddAND = () => {
    const filters = [...this.state._class.filters];
    filters.push([{ prop: '', op: '', val: '' }]);
    this.setState({ _class: {...this.state._class, filters } });
  }

  handleRemoveAND = ANDidx => e => {
    e.stopPropagation();
    const filters = [...this.state._class.filters];
    filters.splice(ANDidx, 1);
    this.setState({ _class: {...this.state._class, filters } });
  }

  handleAddOR = ANDidx => () => {
    const filters = [...this.state._class.filters];
    filters[ANDidx].push({ property: '', op: '', val: '' });
    this.setState({ _class: {...this.state._class, filters } });
  }

  handleRemoveOR = (ANDidx, ORidx) => () => {
    const filters = [...this.state._class.filters];
    filters[ANDidx].splice(ORidx, 1);
    this.setState({ _class: {...this.state._class, filters } });
  }

  handleEdit = () => {
    const { domain, edit } = this.props;
    const { _class } = this.state;
    edit(domain.ID, {
      ..._class,
      children: undefined,
      parentClasses: _class.parentClasses.map(pc => pc.ID),
    })
      .then(() => this.setState({ snackbar: 'Success!', unsaved: false }))
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
  }

  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleChildClicked = child => async event => {
    const { history, domain, fetch } = this.props;
    const stack = [...this.state.stack];
    
    // Change URL
    event.preventDefault();
    history.push('/' + domain.ID + '/classes/' + child.ID);

    // Add class to stack
    stack.push(child);

    // Fetch data of top of stack
    const _class = await fetch(domain.ID, child.ID)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      stack,
      _class: _class ? {
        ..._class,
        parentClasses: _class.parentClasses.map(pc => pc.ID),
        filters: _class.filters || [],
        children: _class.children || [],
      } : {},
    });
  }

  handleBreadcrumb = (id, stackIdx) => async event => {
    const { history, domain, fetch } = this.props;
    
    event.preventDefault();
    history.push('/' + domain.ID + '/classes/' + id);
    
    // Update stack
    const stack = [...this.state.stack].slice(0, stackIdx + 1);

    const _class = await fetch(domain.ID, id)
      .catch(message => this.setState({ snackbar: message || 'Unknown error' }));
    this.setState({
      stack,
      _class: _class ? {
        ..._class,
        parentClasses: _class.parentClasses.map(pc => pc.ID),
        filters: _class.filters || [],
        children: _class.children || [],
      } : {},
    });
  }

  handleMagnitueAutocomplete = (field) => (e, newVal) => {
    this.setState({
      _class: {
        ...this.state._class,
        [field]: newVal,
      },
      autocompleteInput: '',
    });
  }

  handleAutocompleteInput = event => {
    this.setState({
      autocompleteInput: event.target.value,
    });
  }

  render() {
    const { classes, t, domain, _classes } = this.props;
    const writable = this.context.includes(DOMAIN_ADMIN_WRITE);
    const { _class, autocompleteInput, snackbar, stack, loading } = this.state;
    const { classname, parentClasses, filters, children } = _class;
    return (
      <ViewWrapper
        topbarTitle={t('Groups')}
        snackbar={snackbar}
        onSnackbarClose={() => this.setState({ snackbar: '' })}
        loading={loading}
      >
        <Paper className={classes.paper} elevation={1}>
          <Grid container>
            <Typography
              color="primary"
              variant="h5"
            >
              {t('editHeadline', { item: 'Group' })}
            </Typography>
          </Grid>
          <FormControl className={classes.form}>
            <Breadcrumbs className={classes.breadcrumbs}>
              {stack.map((_class, idx) =>
                <Link
                  className={classes.breadcrumb}
                  key={_class.ID}
                  color="inherit"
                  onClick={this.handleBreadcrumb(_class.ID, idx)}
                >
                  {_class.classname}
                </Link>
              )}
            </Breadcrumbs>
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
              onChange={this.handleMagnitueAutocomplete('parentClasses')}
              className={classes.input} 
              options={_classes || []}
              isOptionEqualToValue={(option, value) => value.ID === option.ID}
              onInputChange={this.handleAutocompleteInput}
              label={t("Parent groups")}
              placeholder={t("Search groups") + "..."}
              multiple
              autoSelect
            />
          </FormControl>
          <div>
            <Typography variant="body1">{t('Filters (All must be true)')}</Typography>
            {filters && filters.map((ANDFilter, ANDidx) =>
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
                    <Grid container justifyContent="center">
                      <Button variant="outlined" onClick={this.handleAddOR(ANDidx)}>{t('Add or-statement')}</Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}
            <Grid container justifyContent="center">
              <Button variant="outlined" onClick={this.handleAddAND}>{t('Add and-statement')}</Button>
            </Grid>
          </div>
          <Typography variant="h6">{t('Children')}</Typography>
          <List>
            {children && children.map(child =>
              <ListItem
                key={child.ID}
                button
                onClick={this.handleChildClicked(child)}
              >
                <ListItemText primary={child.classname} />
              </ListItem>
            )}
          </List>
          <Button
            variant="text"
            color="secondary"
            onClick={this.handleNavigation(domain.ID + '/classes')}
            style={{ marginRight: 8 }}
          >
            {t('Back')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleEdit}
            disabled={!writable}
          >
            {t('Save')}
          </Button>
        </Paper>
      </ViewWrapper>
    );
  }
}

ClassDetails.contextType = CapabilityContext;
ClassDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  _classes: PropTypes.array.isRequired,
  fetch: PropTypes.func.isRequired,
  fetchClasses: PropTypes.func.isRequired,
  edit: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return { _classes: state._classes.Select };
};

const mapDispatchToProps = dispatch => {
  return {
    edit: async (domainID, _class) => {
      await dispatch(editClassData(domainID, _class)).catch(message => Promise.reject(message));
    },
    fetch: async (domainID, id) => await dispatch(fetchClassDetails(domainID, id))
      .then(_class => _class)
      .catch(message => Promise.reject(message)),
    fetchClasses: async (domainID) =>
      await dispatch(fetchClassesData(domainID, { sort: 'classname,asc', level: 0, limit: 1000000 }, true))
        .catch(message => Promise.reject(message)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(ClassDetails)));
