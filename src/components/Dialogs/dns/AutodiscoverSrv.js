// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import DefaultDNSDialog from './DefaultDNSDialog';


function AutodiscoverSrv({ onClose, dnsCheck, domain={} }) {
  const mxDomain = dnsCheck.mxRecords.mxDomain?.length > 1 ? dnsCheck.mxRecords.mxDomain : ("mail." + domain.domainname + ".");
  return (
    <DefaultDNSDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      label="Autodiscover SRV"
      field='autodiscoverSRV'
      subtitle="autodiscoverSrv_expl"
      example={<>
        <pre>
          {`${mxDomain}    1    IN    A    `}
          {dnsCheck.externalIp}
        </pre>
        <pre>
          {`_autodiscover._tcp.${domain.domainname || "example.at"}.    1    IN    SRV    0 0 443 ${mxDomain}`}
        </pre>
      </>}
    />
  );
}

AutodiscoverSrv.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default AutodiscoverSrv;