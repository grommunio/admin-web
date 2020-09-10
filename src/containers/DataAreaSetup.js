import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, FormControl, MenuItem, Dialog, DialogContent, DialogTitle,
  Button, DialogActions, Snackbar, CircularProgress } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Alert from '@material-ui/lab/Alert';
import Delete from '@material-ui/icons/Close';
import TopBar from '../components/TopBar';
import { fetchAreasData, addAreaData, deleteAreaData } from '../actions/areas';
import { connect } from 'react-redux';

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
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
  },
  paperHeading: {
    margin: theme.spacing(-1, 0, 0, 2),
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
      maxFiles: 0,
      storeLevels: 2,
    },
    addOpen: false,
    loading: false,
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
    this.setState({ loading: true });
    this.props.add({
      ...this.state.newData,
      accelPath: this.state.accelPath || null,
    })
      .then(() => {
        this.setState({ 
          newData: {
            dataType: 0, 
            masterPath: '', 
            slavePath: '', 
            accelPath: '', 
            maxSpace: 0, 
            maxFiles: 0,
            storeLevels: 2,
          },
          snackbar: 'Success!',
          loading: false,
          addOpen: false,
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

  handleDelete = id => () => {
    this.props.delete(id)
      .then(() => {
        this.getDataAreaData();
        this.setState({ snackbar: 'Success!' });
      })
      .catch(msg => {
        this.setState({ snackbar: msg || 'Unknown error' });
      });
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

  render() {
    const { classes, t, areas } = this.props;
    const { newData, loading } = this.state;

    return (
      <div className={classes.root}>
        <TopBar onAdd={() => this.setState({ addOpen: true })} title="Data Area Setup"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Dialog onClose={() => this.setState({ addOpen: false })} open={this.state.addOpen} maxWidth="lg">
            <DialogTitle>Add</DialogTitle>
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
                  label={t("Database accelerating storage area")} 
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
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.setState({ addOpen: false })}
                variant="contained"
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={this.handleAdd}
                variant="contained"
                color="primary"
              >
                {loading ? <CircularProgress size={24}/> : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Master user data area</TableCell>
                  <TableCell>Master accelerated storage area</TableCell>
                  <TableCell>Slave user data area</TableCell>
                  <TableCell>Maximum space</TableCell>
                  <TableCell>Maximum files</TableCell>
                  <TableCell>Used space</TableCell>
                  <TableCell>Used files</TableCell>
                  <TableCell>User number</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areas.user.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.masterPath}</TableCell>
                    <TableCell>{obj.accelPath}</TableCell>
                    <TableCell>{obj.slavePath}</TableCell>
                    <TableCell>{obj.maxSpace}</TableCell>
                    <TableCell>{obj.maxFiles}</TableCell>
                    <TableCell>{obj.usedSpace}</TableCell>
                    <TableCell>{obj.usedFiles}</TableCell>
                    <TableCell>{obj.usedNumber}</TableCell>
                    <TableCell>
                      <IconButton onClick={this.handleDelete(obj.ID)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableHead>
                <TableRow>
                  <TableCell>Master domain data area</TableCell>
                  <TableCell>Master accelerated storage area</TableCell>
                  <TableCell>Slave domain data area</TableCell>
                  <TableCell>Maximum space</TableCell>
                  <TableCell>Maximum files</TableCell>
                  <TableCell>Used space</TableCell>
                  <TableCell>Used files</TableCell>
                  <TableCell>Domain number</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {areas.domain.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.masterPath}</TableCell>
                    <TableCell>{obj.accelPath}</TableCell>
                    <TableCell>{obj.slavePath}</TableCell>
                    <TableCell>{obj.maxSpace}</TableCell>
                    <TableCell>{obj.maxFiles}</TableCell>
                    <TableCell>{obj.usedSpace}</TableCell>
                    <TableCell>{obj.usedFiles}</TableCell>
                    <TableCell>{obj.usedNumber}</TableCell>
                    <TableCell>
                      <IconButton  onClick={this.handleDelete(obj.ID)} >
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
          <Snackbar
            open={!!this.state.snackbar}
            onClose={() => this.setState({ snackbar: '' })}
            autoHideDuration={this.state.snackbar === 'Success!' ? 1000 : 6000}
            transitionDuration={{ appear: 250, enter: 250, exit: 0 }}
          >
            <Alert
              onClose={() => this.setState({ snackbar: '' })}
              severity={this.state.snackbar === 'Success!' ? "success" : "error"}
              elevation={6}
              variant="filled"
            >
              {this.state.snackbar}
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
  delete: PropTypes.func.isRequired,
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
    delete: async id => {
      await dispatch(deleteAreaData(id)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DataAreaSetup)));