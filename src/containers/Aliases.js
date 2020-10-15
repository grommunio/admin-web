import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper,
  List,
  ListItem,
  Snackbar,
  Divider,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Close';
import { connect } from 'react-redux';
import { fetchAliasesData, deleteAliasData } from '../actions/aliases';
import TopBar from '../components/TopBar';
import AddAlias from '../components/Dialogs/AddAlias';
import GeneralDelete from '../components/Dialogs/GeneralDelete';

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
    borderRadius: 6,
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  expandIcon: {
    paddingRight: 10,
  },
});

class Aliases extends Component {

  state = {
    adding: false,
    deleting: false,
    open: [],
  }

  componentDidMount() {
    this.props.fetch()
      .catch(error => this.setState({ snackbar: error }));
  }

  handleAdd = () => this.setState({ adding: true });

  handleEdit = alias => () => {
    const { history } = this.props;
    history.push('/aliases/' + alias.ID, { ...alias });
  }

  handleDelete = alias => () => this.setState({ deleting: alias });

  handleDeleteSuccess = () => {
    this.setState({ deleting: false, snackbar: 'Success!' });
    this.props.fetch()
      .catch(error => this.setState({ snackbar: error }));
  }

  handleDeleteClose = () => this.setState({ deleting: false });

  handleDeleteError = error => this.setState({ snackbar: error });

  handleAddingSuccess = () => this.setState({ adding: false });

  handleAddingError = error => this.setState({ snackbar: error });

  handleDomainClicked = domainname => () => {
    const { open } = this.state;
    const idx = open.findIndex(d => d === domainname);
    if(idx === -1) {
      this.setState({ open: [...open, domainname] });
    } else {
      const copy = [...open];
      copy.splice(idx, 1);
      this.setState({ open: copy });
    }
  };

  render() {
    const { classes, aliases, t } = this.props;
    const { adding, deleting, open, snackbar } = this.state;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Aliases"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper}>
            <List>
              {Object.entries(aliases).map(([mainName, aliases]) => <React.Fragment key={mainName}>
                <ListItem button onClick={this.handleDomainClicked(mainName)}>
                  <ListItemText primary={mainName} />
                  {open.includes(mainName) ?
                    <ExpandLess className={classes.expandIcon}/> :
                    <ExpandMore className={classes.expandIcon}/>}
                </ListItem>
                <Divider />
                <Collapse in={open.includes(mainName)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {aliases.map(alias => <React.Fragment key={alias.ID}>
                      <ListItem disabled={alias.domainStatus === 3} className={classes.nested}>
                        <ListItemText
                          primary={alias.aliasname + (alias.domainStatus === 3 ? ` [${t('Deleted')}]`  : '')}
                        />
                        {alias.domainStatus !== 3 &&<IconButton onClick={this.handleDelete(alias)} >
                          <Delete fontSize="small" color="error"/> 
                        </IconButton>}
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                    )}        
                  </List>
                </Collapse>
              </React.Fragment>
              )}
            </List>
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
        <AddAlias
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
        />
        <GeneralDelete
          open={!!deleting}
          delete={this.props.delete}
          onSuccess={this.handleDeleteSuccess}
          onError={this.handleDeleteError}
          onClose={this.handleDeleteClose}
          item={deleting.aliasname}
          id={deleting.ID}
        />
      </div>
    );
  }
}

Aliases.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  aliases: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  delete: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return { aliases: state.aliases.Aliases };
};

const mapDispatchToProps = dispatch => {
  return {
    fetch: async () => {
      await dispatch(fetchAliasesData()).catch(msg => Promise.reject(msg));
    },
    delete: async id => {
      await dispatch(deleteAliasData(id)).catch(msg => Promise.reject(msg));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Aliases)));