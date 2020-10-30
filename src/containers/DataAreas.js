import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, FormControl, MenuItem, Dialog, DialogContent, DialogTitle,
  Button, DialogActions, Snackbar, CircularProgress, Select, Grid, Typography} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import TopBar from '../components/TopBar';
import { fetchAreasData, addAreaData } from '../actions/areas';
import { connect } from 'react-redux';
import blue from '../colors/blue';
import HomeIcon from '@material-ui/icons/Home';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  select: {
    minWidth: 60,
  },
  pageTitle: {
    margin: theme.spacing(2),
  },
  buttonGrid: {
    margin: theme.spacing(2),
  },
  pageTitleSecondary: {
    color: '#aaa',
  },
  homeIcon: {
    color: blue[500],
    position: 'relative',
    top: 4,
    left: 4,
    cursor: 'pointer',
  },
});

class DataAreaSetup extends Component {

  componentDidMount() {
    this.getDataAreaData();
  }

  state = {
    snackbar: '',
    newData: {
      dataType: 0, 
      masterPath: '', 
      slavePath: '', 
      accelPath: '', 
      maxSpace: 0,
      storeLevels: 2,
    },
    addOpen: false,
    loading: false,
    sizeUnit: 0,
  }

  getDataAreaData = () => {
    this.props.fetch()
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
  }

  handleInput = field => event => {
    this.setState({
      newData: {
        ...this.state.newData,
        [field]: event.target.value,
      },
    });
  }

  types = [
    { name: 'User data', ID: 0 },
    { name: 'Domain data', ID: 1 },
  ];

  handleAdd = () => {
    const { newData, sizeUnit } = this.state;
    this.setState({ loading: true });
    this.props.add({
      ...newData,
      accelPath: newData.accelPath || null,
      maxSpace: newData.maxSpace << (10 * sizeUnit),
    })
      .then(() => {
        this.setState({ 
          newData: {
            dataType: 0, 
            masterPath: '', 
            slavePath: '', 
            accelPath: '', 
            maxSpace: 0,
            storeLevels: 2,
          },
          snackbar: 'Success!',
          loading: false,
          addOpen: false,
          sizeUnit: 0,
        });
      })
      .catch(msg => {
        this.setState({
          snackbar: msg || 'Unknown error',
          loading: false,
        });
      })
      .then(this.getDataAreaData);
  }

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input === '' || input.match("^\\d*?$")) {
      if(input !== '') input = parseInt(input);
      this.setState({
        newData: {
          ...this.state.newData,
          [field]: input,
        },
      });
    }
  }


  handleNavigation = path => event => {
    const { history } = this.props;
    event.preventDefault();
    history.push(`/${path}`);
  }

  handleUnitChange = event => this.setState({ sizeUnit: event.target.value })

  render() {
    const { classes, t, areas } = this.props;
    const { newData, loading, sizeUnit, addOpen, snackbar } = this.state;

    return (
      <div className={classes.root}>
        <TopBar/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Dialog onClose={() => this.setState({ addOpen: false })} open={addOpen} maxWidth="lg">
            <DialogTitle>{t('addHeadline', { item: 'Data area' })}</DialogTitle>
            <DialogContent style={{ minWidth: 400 }}>
              <FormControl className={classes.form}>
                <TextField
                  select
                  className={classes.input}
                  label={t("Data type")}
                  fullWidth
                  value={newData.dataType}
                  onChange={this.handleInput('dataType')}
                >
                  {this.types.map((type, key) => (
                    <MenuItem key={key} value={type.ID}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField 
                  className={classes.input} 
                  label={t("Master data area")}
                  fullWidth
                  value={newData.masterPath}
                  onChange={this.handleInput('masterPath')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Accelerated storage area")} 
                  fullWidth
                  value={newData.accelPath}
                  onChange={this.handleInput('accelPath')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Slave data area")} 
                  fullWidth
                  value={newData.slavePath}
                  onChange={this.handleInput('slavePath')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Maximum space")} 
                  fullWidth 
                  value={newData.maxSpace}
                  onChange={this.handleNumberInput('maxSpace')}
                  InputProps={{
                    endAdornment:
                      <FormControl>
                        <Select
                          onChange={this.handleUnitChange}
                          value={sizeUnit}
                          className={classes.select}
                        >
                          <MenuItem value={0}>MiB</MenuItem>
                          <MenuItem value={1}>GiB</MenuItem>
                          <MenuItem value={2}>TiB</MenuItem>
                        </Select>
                      </FormControl>,
                  }}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.setState({ addOpen: false })}
                variant="contained"
                color="secondary"
              >
                {t('Cancel')}
              </Button>
              <Button
                onClick={this.handleAdd}
                variant="contained"
                color="primary"
              >
                {loading ? <CircularProgress size={24}/> : t('Add')}
              </Button>
            </DialogActions>
          </Dialog>
          <Typography variant="h2" className={classes.pageTitle}>
            {t("Data areas ")}
            <span className={classes.pageTitleSecondary}>|</span>
            <HomeIcon onClick={this.handleNavigation('')} className={classes.homeIcon}></HomeIcon>
          </Typography>
          <Grid className={classes.buttonGrid}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.setState({ addOpen: true })}
            >
              Add new data area
            </Button>
          </Grid>
          <Paper elevation={1}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Master user data area')}</TableCell>
                  <TableCell>{t('Accelerated storage area')}</TableCell>
                  <TableCell>{t('Slave user data area')}</TableCell>
                  <TableCell>{t('Maximum space')}</TableCell>
                  <TableCell>{t('Used space')}</TableCell>
                  <TableCell>{t('User number')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areas.user.map((obj, idx) =>
                  <TableRow hover key={idx}>
                    <TableCell>{obj.masterPath}</TableCell>
                    <TableCell>{obj.accelPath}</TableCell>
                    <TableCell>{obj.slavePath}</TableCell>
                    <TableCell>{obj.maxSpace}</TableCell>
                    <TableCell>{obj.usedSpace}</TableCell>
                    <TableCell>{obj.usedNumber}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
          <Paper elevation={1}>
            <Table size="medium">
              <TableHead>
                <TableRow>
                  <TableCell>{t('Master domain data area')}</TableCell>
                  <TableCell>{t('Accelerated storage area')}</TableCell>
                  <TableCell>{t('Slave domain data area')}</TableCell>
                  <TableCell>{t('Maximum space')}</TableCell>
                  <TableCell>{t('Used space')}</TableCell>
                  <TableCell>{t('Domain number')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areas.domain.map((obj, idx) =>
                  <TableRow hover key={idx}>
                    <TableCell>{obj.masterPath}</TableCell>
                    <TableCell>{obj.accelPath}</TableCell>
                    <TableCell>{obj.slavePath}</TableCell>
                    <TableCell>{obj.maxSpace}</TableCell>
                    <TableCell>{obj.usedSpace}</TableCell>
                    <TableCell>{obj.usedNumber}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
          <Snackbar
            open={!!snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {snackbar}
            </Alert>
          </Snackbar>
        </div>
      </div>
    );
  }
}

DataAreaSetup.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  areas: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  add: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  return {
    areas: state.areas.Areas,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchAreasData()).catch(msg => Promise.reject(msg));
    },
    add: async area => {
      await dispatch(addAreaData(area)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DataAreaSetup)));