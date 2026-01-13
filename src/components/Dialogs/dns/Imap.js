// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import DefaultDavDialog from './DefaultDavDialog';


function Imap({ onClose, dnsCheck={}, domain }) {
  const mxDomain = dnsCheck.mxRecords.mxDomain?.length > 1 ? dnsCheck.mxRecords.mxDomain : ("mail." + domain.domainname + ".");
  return (
    <DefaultDavDialog
      onClose={onClose}
      dnsCheck={dnsCheck}
      title="IMAP(s) SRV"
      subtitle="imap_expl"
      label1='IMAP check result'
      label2='IMAPs check result'
      field1='imapSRV'
      field2='imapsSRV'
      example={<>
        <pre>
          {`${mxDomain}    1    IN    A    `}
          {dnsCheck.externalIp}
        </pre>
        <pre>
          {`_imaps._tcp.${domain.domainname || "example.at"}.    1    IN    SRV    0 0 993 ${mxDomain}
_imap._tcp.${domain.domainname || "example.at"}.     1    IN    SRV    0 0 143 ${mxDomain}`}
        </pre>
      </>}
    />
  );
}

Imap.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object,
};

export default Imap;