import React, { PureComponent } from 'react';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { AddCircle, CopyAll } from '@mui/icons-material';
import { Trans, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { addItem, copyToClipboard } from '../../utils';

const styles = theme => ({
  paper: {
    margin: theme.spacing(3, 2, 3, 2),
    padding: theme.spacing(2, 2, 2, 2),
  },
  grid: {
    margin: theme.spacing(0, 1),
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: theme.spacing(1),
  },
  input: {
    margin: theme.spacing(1),
  },
  flexBox: {
    display: 'flex',
  },
  imgPreview: {
    maxWidth: '100%',
  },
  imageGroup: {
    margin: theme.spacing(0, 0, 4, 0),
  },
  jsonPreview: {
    whiteSpace: 'pre',
  },
  pre: {
    display: 'inline',
    margin: theme.spacing(0, 0.5)
  },
  subtitle: {
    margin: theme.spacing(2, 0, 0, 2),
  }
});

class Design extends PureComponent {

  state = {
    customImages: [],
    configOpen: false,
  }

  componentDidMount() {
    this.setState({
      customImages: Object.entries(this.props.customImages)
        .map(([hostname, images]) => ({ hostname, ...images})),
    });
  }

  handleAddImageGroup = () => this.setState({
    customImages: addItem(this.state.customImages, {}),
  });

  handleImgInput = (field, idx) => e => {
    const copy = [...this.state.customImages];
    copy[idx][field] = e.target.value;
    this.setState({ customImages: copy });
  }

  // Saves stringified config object to clipboard
  handleCopyToClipboard = () => {
    copyToClipboard('"customImages": ' + JSON.stringify(
      this.state.customImages.reduce((prevValue, currentValue) => ({
        ...prevValue,
        [currentValue.hostname]: {
          ...currentValue,
          hostname: undefined,
        },
      }), {}), null, 4)
    )
  }

  handleShowConfig = () => this.setState({ configOpen: true });

  handleConfigClose = () => this.setState({ configOpen: false });

  render() {
    const { classes, t } = this.props;
    const { customImages, configOpen } = this.state;
    return <>
      <Typography variant="caption" className={classes.subtitle}>
        {t("design_sub")}
      </Typography>
      <Paper className={classes.paper} elevation={1}>
        {customImages.map(({ hostname, logo, logoLight, icon, background, backgroundDark}, idx) =>
          <div className={classes.imageGroup} key={idx}>
            <TextField
              label={t("Hostname")}
              value={hostname || ''}
              className={classes.input}
              required
              fullWidth
              onChange={this.handleImgInput("hostname", idx)}
            />
            <div className={classes.flexBox}>
              <Grid container direction="column" alignItems="center" className={classes.grid}>
                <TextField
                  label={t("Logo")}
                  value={logo || ''}
                  className={classes.iconInput}
                  variant="standard"
                  onChange={this.handleImgInput("logo", idx)}
                  fullWidth
                />
                <img src={logo || ''} alt="" className={classes.imgPreview}/>
              </Grid>
              <Grid container direction="column"  alignItems="center" className={classes.grid}>
                <TextField
                  label={t("Logo light")}
                  value={logoLight || ''}
                  className={classes.iconInput}
                  variant="standard"
                  onChange={this.handleImgInput("logoLight", idx)}
                  fullWidth
                />
                <img src={logoLight || ''} alt="" className={classes.imgPreview}/>
              </Grid>
              <Grid container direction="column"  alignItems="center" className={classes.grid}>
                <TextField
                  label={t("Icon")}
                  value={icon || ''}
                  className={classes.iconInput}
                  variant="standard"
                  onChange={this.handleImgInput("icon", idx)}
                  fullWidth
                />
                <img src={icon || ''} alt="" className={classes.imgPreview}/>
              </Grid>
              <Grid container direction="column" alignItems="center" className={classes.grid}>
                <TextField
                  label={t("Background")}
                  value={background || ''}
                  className={classes.iconInput}
                  variant="standard"
                  onChange={this.handleImgInput("background", idx)}
                  fullWidth
                />
                <img src={background || ''} alt="" className={classes.imgPreview}/>
              </Grid>
              <Grid container direction="column" alignItems="center" className={classes.grid}>
                <TextField
                  label={t("Background dark")}
                  value={backgroundDark || ''}
                  className={classes.iconInput}
                  variant="standard"
                  onChange={this.handleImgInput("backgroundDark", idx)}
                  fullWidth
                />
                <img src={backgroundDark || ''} alt="" className={classes.imgPreview}/>
              </Grid>
            </div>
          </div>
        )}
        <div className={classes.progressContainer}>
          <Tooltip title={t("Add new set of icons for explicit hostname")}>
            <IconButton onClick={this.handleAddImageGroup}>
              <AddCircle color="primary"/>
            </IconButton>
          </Tooltip>
        </div>
        <Grid container>
          <Button variant='contained' onClick={this.handleShowConfig}>
            {t("Show config")}
          </Button>
        </Grid>
      </Paper>
      <Dialog
        maxWidth="lg"
        fullWidth
        onClose={this.handleConfigClose}
        open={configOpen}
      >
        <DialogTitle>
          {t("Serverconfig")}
          <Tooltip placement="top" title={t('Copy config')}>
            <IconButton onClick={this.handleCopyToClipboard} size="large">
              <CopyAll />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          <pre>
            <code className={classes.jsonPreview}>
              &quot;customImages&quot;: {JSON.stringify(customImages.reduce((prevValue, currentValue) => ({
                ...prevValue,
                [currentValue.hostname]: {
                  ...currentValue,
                  hostname: undefined,
                },
              }), {}), null, 4)}
            </code>
          </pre>
          <Typography className={classes.typography}>
            <Trans i18nKey="configInstructions1">
              Copy these lines into
              <pre className={classes.pre}>
                /etc/grommunio-admin-common/config.json
              </pre>
            </Trans>.
            <Trans i18nKey="configInstructions2">
              Be careful not to duplicate the
              <pre className={classes.pre}>
                &quot;customImages&quot;
              </pre>
              key
            </Trans>.
          </Typography>
        </DialogContent>
      </Dialog></>
  }
}

Design.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  customImages: PropTypes.object,
}

const mapStateToProps = state => {
  const { config } = state;
  return {
    customImages: config.customImages,
  };
};

export default connect(mapStateToProps)(
  withTranslation()(withStyles(styles)(Design)));
