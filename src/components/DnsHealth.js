import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Chip, CircularProgress, Tooltip } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { AlternateEmail, CallReceived, EventRepeat, Mail, OnDeviceTraining, Policy, Send, TravelExplore, HelpOutline } from '@mui/icons-material';
import { getChipColorFromScore } from '../utils';
import { connect } from 'react-redux';
import { fetchDnsCheckData } from '../actions/domains';


const styles = {
  dnsChips: {
    marginTop: 8,
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    color: 'black',
    marginRight: 8,
    marginTop: 4,
  }
}

function getEquationValuesFromRequirementTypes(typeA, typeB) {
  return {
    "reqreq": [-10, 55, 55],
    "reqrec": [15, 55, 30],
    "req": [25, 55, 20],
    "recrec": [54, 23, 23],
    "rec": [54, 33, 13],
    "": [80, 10, 10],
  }[typeA+typeB];
}

function scoreDNSResult(valueA, valueB, reqAType="", reqBType="") {
  const equationValues = getEquationValuesFromRequirementTypes(reqAType, reqBType);
  const valueMultiplier = [1, valueA ? 1 : 0, valueB ? 1 : 0];
  const res = equationValues.map((val, idx) => val * valueMultiplier[idx])
    .reduce((prev, value) => prev + value, 0);
  return res;
}

class DnsHealth extends PureComponent {

  state = {
    loading: true,
    dnsCheck: {},
    InfoDialog: null,
  }

  componentDidMount() {
    const { checkDns, domain } = this.props;
    checkDns(domain.ID)
      .then(dnsCheck => {
        this.setState({dnsCheck, loading: false});
      })
      .catch(message => this.setState({ snackbar: message || 'Unknown error', loading: false }));
  }

  getReachabiltyColor() {
    const { dnsCheck } = this.state;
    return !dnsCheck.externalIp ? "error" : "success";
  }

  getMXColor() {
    const { dnsCheck } = this.state;
    const { mxRecords, externalIp, localIp } = dnsCheck;
    if(!mxRecords) return "error";

    const score = scoreDNSResult(mxRecords.externalDNS, mxRecords.internalDNS, "req", "rec");
    const matchScore = scoreDNSResult(
      mxRecords.externalDNS === externalIp,
      [localIp, externalIp].includes(mxRecords.internalDNS),
      "",
      "");
    return getChipColorFromScore(Math.min(score, matchScore));
  }

  getAutodiscoverColor() {
    const { dnsCheck } = this.state;
    const { autodiscover, externalIp, localIp } = dnsCheck;
    if(!autodiscover) return "error";

    const score = scoreDNSResult(autodiscover.internalDNS, autodiscover.externalDNS, "rec", "rec");
    const matchScore = scoreDNSResult(
      autodiscover.externalDNS === externalIp,
      [localIp, externalIp].includes(autodiscover.internalDNS),
      "",
      "");
    return getChipColorFromScore(Math.min(score, matchScore));
  }

  getAutodiscoverSrvColor() {
    const { dnsCheck } = this.state;
    const { autodiscoverSRV, externalIp, localIp } = dnsCheck;
    if(!autodiscoverSRV) return "error";

    // TODO: Check for port
    const score = scoreDNSResult(autodiscoverSRV.internalDNS, autodiscoverSRV.externalDNS, "rec", "rec");
    const matchScore = scoreDNSResult(
      autodiscoverSRV.externalDNS === externalIp,
      [localIp, externalIp].includes(autodiscoverSRV.internalDNS),
      "",
      "");
    return getChipColorFromScore(Math.min(score, matchScore));
  }
  
  getAutoconfigColor() {
    const { dnsCheck } = this.state;
    const { autoconfig, externalIp, localIp } = dnsCheck;
    if(!autoconfig) return "error";

    // TODO: Check for port
    const score = scoreDNSResult(autoconfig.internalDNS, autoconfig.externalDNS, "rec", "");
    const matchScore = scoreDNSResult(
      autoconfig.externalDNS === externalIp,
      [localIp, externalIp].includes(autoconfig.internalDNS),
      "",
      "");
    return getChipColorFromScore(Math.min(score, matchScore));
  }

  getSpfColor() {
    const { dnsCheck } = this.state;
    const { txt } = dnsCheck;
    if(!txt) return "error";

    const score = scoreDNSResult(txt.externalDNS, txt.internalDNS, "rec", "");
    return getChipColorFromScore(score);
  }

  getDkimColor() {
    const { dnsCheck } = this.state;
    const { dkim } = dnsCheck;
    if(!dkim) return "error";

    const score = scoreDNSResult(dkim.externalDNS, dkim.internalDNS, "rec", "");
    return getChipColorFromScore(score);
  }

  getDmarcColor() {
    const { dnsCheck } = this.state;
    const { dkim } = dnsCheck;
    if(!dkim) return "error";

    const score = scoreDNSResult(dkim.externalDNS, dkim.internalDNS, "rec", "");
    return getChipColorFromScore(score);
  }

  getOptionalSrvColor(records=[]) {
    const { dnsCheck } = this.state;

    const scores = records.map(record => {
      if(!dnsCheck[record]) return "error";
  
      return scoreDNSResult(dnsCheck[record].externalDNS, dnsCheck[record].internalDNS, "", "");
    });
    return getChipColorFromScore(Math.min(...scores));
  }

  getDavTxtColor(record) {
    const { dnsCheck } = this.state;
    if(!dnsCheck[record]) return "error";

    const score = scoreDNSResult(dnsCheck[record].externalDNS?.includes("86400"), dnsCheck[record].internalDNS?.includes("86400"), "", "");
    return getChipColorFromScore(score);
  }

  asyncDialogImport = path => async () => {
    const InfoDialog = await import("./Dialogs/dns/" + path)
      .then(component => component.default)
      .catch(() => console.log("Failed to import dialog"));
    this.setState({ InfoDialog: InfoDialog || null });
  }

  handleDialogClose = () => this.setState({ InfoDialog: null });

  render() {
    const { classes, t } = this.props;
    const { loading, InfoDialog, dnsCheck } = this.state;
    return <div className={classes.dnsChips}>
      <DNSChip
        title={t("external_ip_expl")}
        label={t("Reachability")}
        icon={<CallReceived />}
        color={this.getReachabiltyColor()}
        loading={loading}
        onInfo={this.asyncDialogImport('Reachability')}
      />
      <DNSChip
        title={t("mx_expl")}
        label={t("MX Records")}
        icon={<Mail />}
        color={this.getMXColor()}
        loading={loading}
        onInfo={this.asyncDialogImport('MXRecords')}
      />
      <DNSChip
        title={t("autodiscover_expl")}
        label={t("Autodiscover")}
        icon={<TravelExplore />}
        color={this.getAutodiscoverColor()}
        loading={loading}
        onInfo={this.asyncDialogImport('Autodiscover')}
      />
      <DNSChip
        title={t("autodiscoverSrv_expl")}
        label={t("Autodiscover SRV")}
        icon={<TravelExplore />}
        color={this.getAutodiscoverSrvColor()}
        loading={loading}
        onInfo={this.asyncDialogImport('AutodiscoverSrv')}
      />
      <DNSChip
        title={t("autoconfig_expl")}
        label={t("Autoconfig")}
        icon={<TravelExplore />}
        color={this.getAutoconfigColor()}
        loading={loading}
        onInfo={this.asyncDialogImport('Autoconfig')}
      />
      <DNSChip
        title={t("spf_expl")}
        label={t("SPF Records")}
        icon={<Policy />}
        color={this.getSpfColor()}
        loading={loading}
        onInfo={this.asyncDialogImport('Spf')}
      />
      <DNSChip
        title={t("dkim_expl")}
        label={t("DKIM")}
        icon={<Policy />}
        color={this.getDkimColor()}
        loading={loading}
        onInfo={this.asyncDialogImport('Dkim')}
      />
      <DNSChip
        title={t("dmarc_expl")}
        label={t("DMARC")}
        icon={<Policy />}
        color={this.getDmarcColor()}
        loading={loading}
        onInfo={this.asyncDialogImport('Dmarc')}
      />
      <DNSChip
        title={t("caldav_expl")}
        label={t("Caldav(s) TXT")}
        icon={<EventRepeat />}
        color={this.getDavTxtColor("caldavTXT")}
        loading={loading}
        onInfo={this.asyncDialogImport('DavTxt')}
      />
      <DNSChip
        title={t("carddav_expl")}
        label={t("Carddav(s) TXT")}
        icon={<OnDeviceTraining />}
        color={this.getDavTxtColor("carddavTXT")}
        loading={loading}
        onInfo={this.asyncDialogImport('DavTxt')}
      />
      <DNSChip
        title={t("caldav_expl")}
        label={t("Caldav(s) SRV")}
        icon={<EventRepeat />}
        color={this.getOptionalSrvColor(["caldavSRV", "caldavsSRV"])}
        loading={loading}
        onInfo={this.asyncDialogImport('Caldav')}
      />
      <DNSChip
        title={t("carddav_expl")}
        label={t("Carddav(s) SRV")}
        icon={<OnDeviceTraining />}
        color={this.getOptionalSrvColor(["carddavSRV", "carddavsSRV"])}
        loading={loading}
        onInfo={this.asyncDialogImport('Carddav')}
      />
      <DNSChip
        title={t("imap_expl")}
        label={t("IMAP(s) SRV")}
        icon={<AlternateEmail />}
        color={this.getOptionalSrvColor(["imapSRV", "imapsSRV"])}
        loading={loading}
        onInfo={this.asyncDialogImport('Imap')}
      />
      <DNSChip
        title={t("pop3_expl")}
        label={t("POP3(s) SRV")}
        icon={<AlternateEmail />}
        color={this.getOptionalSrvColor(["pop3SRV", "pop3sSRV"])}
        loading={loading}
        onInfo={this.asyncDialogImport('Pop3')}
      />
      <DNSChip
        title={t("submission_expl")}
        label={t("Submission(s) SRV")}
        icon={<Send />}
        color={this.getOptionalSrvColor(["submissionSRV"])}
        loading={loading}
        onInfo={this.asyncDialogImport('Submission')}
      />
      {InfoDialog && <InfoDialog onClose={this.handleDialogClose} dnsCheck={dnsCheck}/>}
    </div>
  }
}

const DNSChip = withTranslation()(withStyles(styles)(({ classes, t, loading, label, color, icon, onInfo }) => {
  return <Chip
    className={classes.chip}
    label={label}
    icon={loading ? <CircularProgress size={16}/> : icon}
    color={loading ? "secondary" : color}
    deleteIcon={<Tooltip title={t("Details")} placement="top"><HelpOutline /></Tooltip>}
    onDelete={onInfo}
  />
}));

const mapDispatchToProps = (dispatch) => {
  return {
    checkDns: async domainID =>
      await dispatch(fetchDnsCheckData(domainID)).catch(msg => Promise.reject(msg)),
  };
}

DnsHealth.propTypes = {
  classes: PropTypes.object.isRequired,
  checkDns: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  domain: PropTypes.object.isRequired,
}

export default connect(null, mapDispatchToProps)(
  withTranslation()(withStyles(styles)(DnsHealth)));
