// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import DefaultDNSDialog from './DefaultDNSDialog';


function Autoconfig({ onClose, dnsCheck={}, domain={} }) {
  const mxDomain = dnsCheck.mxRecords.mxDomain?.length > 1 ? dnsCheck.mxRecords.mxDomain : ("mail." + domain.domainname + ".");
  return (
    <DefaultDNSDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      label="Autoconfig"
      field='autoconfig'
      subtitle="autoconfig_expl"
      example={<>
        <pre>
          {`${mxDomain}    1    IN    A    ${dnsCheck.externalIp}`}
        </pre>
        <pre>
          {`autoconfig.${domain.domainname || "example.at"}.    1    IN    CNAME    ${mxDomain}`}
        </pre>
      </>}
    />
  );
}

Autoconfig.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default Autoconfig;