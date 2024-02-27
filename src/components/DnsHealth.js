import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import { Chip, CircularProgress } from '@mui/material';
import { withTranslation } from 'react-i18next';
import { AlternateEmail, CallReceived, EventRepeat, Mail, OnDeviceTraining, Policy, Send, TravelExplore } from '@mui/icons-material';
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
    margin: '4px 8px',
    padding: '20px 12px',
    boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
    '&:hover': {
      boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.3),0px 4px 5px 0px rgba(0,0,0,0.3),0px 1px 10px 0px rgba(0,0,0,0.3)",
    },
  },
  help: {
    color: "black !important",
  },
  chipIcon: {
    marginRight: "-2px !important",
  },
  cp: {
    marginRight: "0px !important",
    marginLeft: "7px !important",  // This is fine-tuned
  },
}

function getEquationValuesFromRequirementTypes(typeA, typeB) {
  return {
    "reqreq": [-10, 55, 55],
    "reqrec": [15, 55, 30],
    "reqopt": [25, 55, 20],
    "recrec": [54, 23, 23],
    "recopt": [54, 33, 13],
    "optopt": [80, 10, 10],
  }[typeA+typeB];
}

function scoreDNSResult(valueA, valueB, reqAType="opt", reqBType="opt") {
  const equationValues = getEquationValuesFromRequirementTypes(reqAType, reqBType);
  const valueMultiplier = [1, valueA ? 1 : 0, valueB ? 1 : 0];
  const res = equationValues.map((val, idx) => val * valueMultiplier[idx])
    .reduce((prev, value) => prev + value, 0);
  return res;
}

const errorColor = "#d32f2f";
const successColor = "#66bb6a";

const DnsHealth = props => {
  const [state, setState] = useState({
    loading: true,
    dnsCheck: {},
    InfoDialog: null,
  });

  useEffect(() => {
    const { checkDns, domain } = props;
    checkDns(domain.ID)
      .then(dnsCheck => {
        setState({ ...state, dnsCheck, loading: false});
      })
      .catch(message => setState({ ...state, snackbar: message || 'Unknown error', loading: false }));
  }, []);

  const getReachabiltyColor = () => {
    const { dnsCheck } = state;
    return !dnsCheck.externalIp ? errorColor : successColor;
  }

  const getMXColor = () => {
    const { dnsCheck } = state;
    const { mxRecords, externalIp, localIp } = dnsCheck;
    if(!mxRecords) return errorColor;

    const { externalDNS, internalDNS, reverseLookup, mxDomain } = mxRecords;
    //TODO: Check reverse
    const score = scoreDNSResult(externalDNS, internalDNS, "req", "rec");

    const reverseLookupScore = mxDomain === reverseLookup ? score : 70; // Warning, if reverse lookup fails

    const matchScore = scoreDNSResult(
      externalDNS === externalIp,
      [localIp, externalIp].includes(internalDNS),
      "opt",
      "opt");
    return getChipColorFromScore(Math.min(score, matchScore, reverseLookupScore));
  }

  const getAutodiscoverColor = () => {
    const { dnsCheck } = state;
    const { autodiscover, externalIp, localIp } = dnsCheck;
    if(!autodiscover) return errorColor;

    const score = scoreDNSResult(autodiscover.internalDNS, autodiscover.externalDNS, "rec", "rec");
    const matchScore = scoreDNSResult(
      autodiscover.externalDNS === externalIp,
      [localIp, externalIp].includes(autodiscover.internalDNS),
      "opt",
      "opt");
    return getChipColorFromScore(Math.min(score, matchScore));
  }

  const getAutodiscoverSrvColor = () => {
    const { dnsCheck } = state;
    const { autodiscoverSRV, externalIp, localIp } = dnsCheck;
    if(!autodiscoverSRV) return errorColor;

    // TODO: Check for port
    const score = scoreDNSResult(autodiscoverSRV.internalDNS, autodiscoverSRV.externalDNS, "rec", "rec");
    const matchScore = scoreDNSResult(
      autodiscoverSRV.ip === externalIp,
      [localIp, externalIp].includes(autodiscoverSRV.ip),
      "opt",
      "opt");
    return getChipColorFromScore(Math.min(score, matchScore));
  }
  
  const getAutoconfigColor = () => {
    const { dnsCheck } = state;
    const { autoconfig, externalIp, localIp } = dnsCheck;
    if(!autoconfig) return errorColor;

    // TODO: Check for port
    const score = scoreDNSResult(autoconfig.internalDNS, autoconfig.externalDNS, "rec", "opt");
    const matchScore = scoreDNSResult(
      autoconfig.externalDNS === externalIp,
      [localIp, externalIp].includes(autoconfig.internalDNS),
      "opt",
      "opt");
    return getChipColorFromScore(Math.min(score, matchScore));
  }

  const getSpfColor = () => {
    const { dnsCheck } = state;
    const { txt } = dnsCheck;
    if(!txt) return errorColor;

    const score = scoreDNSResult(txt.externalDNS, true, "rec", "opt");
    return getChipColorFromScore(score);
  }

  const getDkimColor = () => {
    const { dnsCheck } = state;
    const { dkim } = dnsCheck;
    if(!dkim) return errorColor;

    const score = scoreDNSResult(dkim.externalDNS, true, "rec", "opt");
    return getChipColorFromScore(score);
  }

  const getDmarcColor = () => {
    const { dnsCheck } = state;
    const { dkim } = dnsCheck;
    if(!dkim) return errorColor;

    const score = scoreDNSResult(dkim.externalDNS, true, "rec", "opt");
    return getChipColorFromScore(score);
  }

  const getOptionalSrvColor = (records=[]) => {
    const { dnsCheck } = state;

    const scores = records.map(record => {
      if(!dnsCheck[record]) return errorColor;
  
      return scoreDNSResult(dnsCheck[record].externalDNS, dnsCheck[record].internalDNS, "opt", "opt");
    });
    return getChipColorFromScore(Math.min(...scores));
  }

  const getDavTxtColor = (record) => {
    const { dnsCheck } = state;
    if(!dnsCheck[record]) return errorColor;

    const score = scoreDNSResult(dnsCheck[record].externalDNS === '"path=/dav"',
      dnsCheck[record].internalDNS === '"path=/dav"', "opt", "opt");
    return getChipColorFromScore(score);
  }

  const asyncDialogImport = path => async () => {
    const InfoDialog = await import("./Dialogs/dns/" + path)
      .then(component => component.default)
      .catch(() => console.log("Failed to import dialog"));
    setState({ ...state, InfoDialog: InfoDialog || null });
  }

  const handleDialogClose = () => setState({ ...state, InfoDialog: null });

  const { classes, t, domain } = props;
  const { loading, InfoDialog, dnsCheck } = state;
  return <div className={classes.dnsChips}>
    <DNSChip
      title={t("external_ip_expl")}
      label={t("Reachability")}
      icon={CallReceived}
      color={getReachabiltyColor()}
      loading={loading}
      onInfo={asyncDialogImport('Reachability')}
    />
    <DNSChip
      title={t("mx_expl")}
      label={t("MX Records")}
      icon={Mail}
      color={getMXColor()}
      loading={loading}
      onInfo={asyncDialogImport('MXRecords')}
    />
    <DNSChip
      title={t("autodiscover_expl")}
      label={t("Autodiscover")}
      icon={TravelExplore}
      color={getAutodiscoverColor()}
      loading={loading}
      onInfo={asyncDialogImport('Autodiscover')}
    />
    <DNSChip
      title={t("autodiscoverSrv_expl")}
      label={t("Autodiscover SRV")}
      icon={TravelExplore}
      color={getAutodiscoverSrvColor()}
      loading={loading}
      onInfo={asyncDialogImport('AutodiscoverSrv')}
    />
    <DNSChip
      title={t("autoconfig_expl")}
      label={t("Autoconfig")}
      icon={TravelExplore}
      color={getAutoconfigColor()}
      loading={loading}
      onInfo={asyncDialogImport('Autoconfig')}
    />
    <DNSChip
      title={t("spf_expl")}
      label={t("SPF Records")}
      icon={Policy}
      color={getSpfColor()}
      loading={loading}
      onInfo={asyncDialogImport('Spf')}
    />
    <DNSChip
      title={t("dkim_expl")}
      label={t("DKIM")}
      icon={Policy}
      color={getDkimColor()}
      loading={loading}
      onInfo={asyncDialogImport('Dkim')}
    />
    <DNSChip
      title={t("dmarc_expl")}
      label={t("DMARC")}
      icon={Policy}
      color={getDmarcColor()}
      loading={loading}
      onInfo={asyncDialogImport('Dmarc')}
    />
    <DNSChip
      title={t("caldav_expl")}
      label={t("DAV TXT")}
      icon={EventRepeat}
      color={getDavTxtColor("caldavTXT")}
      loading={loading}
      onInfo={asyncDialogImport('DavTxt')}
    />
    <DNSChip
      title={t("caldav_expl")}
      label={t("CalDAV(s) SRV")}
      icon={EventRepeat}
      color={getOptionalSrvColor(["caldavSRV", "caldavsSRV"])}
      loading={loading}
      onInfo={asyncDialogImport('Caldav')}
    />
    <DNSChip
      title={t("carddav_expl")}
      label={t("CardDAV(s) SRV")}
      icon={OnDeviceTraining}
      color={getOptionalSrvColor(["carddavSRV", "carddavsSRV"])}
      loading={loading}
      onInfo={asyncDialogImport('Carddav')}
    />
    <DNSChip
      title={t("imap_expl")}
      label={t("IMAP(s) SRV")}
      icon={AlternateEmail}
      color={getOptionalSrvColor(["imapSRV", "imapsSRV"])}
      loading={loading}
      onInfo={asyncDialogImport('Imap')}
    />
    <DNSChip
      title={t("pop3_expl")}
      label={t("POP3(s) SRV")}
      icon={AlternateEmail}
      color={getOptionalSrvColor(["pop3SRV", "pop3sSRV"])}
      loading={loading}
      onInfo={asyncDialogImport('Pop3')}
    />
    <DNSChip
      title={t("submission_expl")}
      label={t("Submission SRV")}
      icon={Send}
      color={getOptionalSrvColor(["submissionSRV"])}
      loading={loading}
      onInfo={asyncDialogImport('Submission')}
    />
    {InfoDialog && <InfoDialog onClose={handleDialogClose} dnsCheck={dnsCheck} domain={domain}/>}
  </div>
}

const DNSChip = withTranslation()(withStyles(styles)(({ classes, loading, label, color, icon: Icon, onInfo }) => {
  return <Chip
    className={classes.chip}
    style={{ backgroundColor: loading ? "#969696" : color }}
    label={label}
    icon={loading ? <CircularProgress size={20} className={classes.cp}/> : <Icon className={classes.chipIcon} />}
    color={"info"}  // Necessary for icon color
    onClick={onInfo}
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
