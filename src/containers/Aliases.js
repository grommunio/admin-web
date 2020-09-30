import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper,
  List,
  ListItem,
} from '@material-ui/core';
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
});

class Aliases extends Component {

  state = {
    adding: false,
    deleting: false,
    open: [],
  }

  componentDidMount() {
    this.props.fetch();
  }

  handleAdd = () => this.setState({ adding: true });

  handleEdit = alias => () => {
    const { history } = this.props;
    history.push('/aliases/' + alias.ID, { ...alias });
  }

  handleDelete = id => event => {
    event.stopPropagation();
    this.props.delete(id).then(this.props.fetch);
  }

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
    const { classes, aliases } = this.props;
    const { adding, open } = this.state;

    return (
      <div className={classes.root}>
        <TopBar onAdd={this.handleAdd} title="Aliases"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Paper className={classes.tablePaper}>
            <List>
              {Object.entries(aliases).map(([key, value]) => <React.Fragment key={key}>
                <ListItem button onClick={this.handleDomainClicked(key)}>
                  <ListItemText primary={key} />
                  {open.includes(key) ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open.includes(key)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {value.map(val =>
                      <ListItem key={val} button className={classes.nested}>
                        <ListItemText primary={val} />
                        <IconButton onClick={this.handleDelete} /*wont work yet*/ >
                          <Delete fontSize="small" /> 
                        </IconButton>
                      </ListItem>
                    )}
                    
                  </List>
                </Collapse>
              </React.Fragment>
              )}
            </List>
          </Paper>
        </div>
        <AddAlias
          open={adding}
          onSuccess={this.handleAddingSuccess}
          onError={this.handleAddingError}
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
      await dispatch(fetchAliasesData());
    },
    delete: async id => {
      await dispatch(deleteAliasData(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(Aliases)));