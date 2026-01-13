// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React from 'react';
import PropTypes from 'prop-types';
import DefaultDNSDialog from './DefaultDNSDialog';


function Submission({ onClose, dnsCheck={}, domain={} }) {
  const mxDomain = dnsCheck.mxRecords.mxDomain?.length > 1 ? dnsCheck.mxRecords.mxDomain : ("mail." + domain.domainname + ".");
  return <DefaultDNSDialog
    onClose={onClose}
    dnsCheck={dnsCheck}
    label="Submission SRV"
    field='submissionSRV'
    subtitle="submission_expl"
    example={<>
      <pre>
        {`${mxDomain}    1    IN    A    `}
        {dnsCheck.externalIp}
      </pre>
      <pre>
        {`_submission._tcp.${domain.domainname || "example.at"}.    1    IN    SRV    0 0 587 ${mxDomain}`}
      </pre>
    </>}
    domain={domain}
  />;
}

Submission.propTypes = {
  onClose: PropTypes.func,
  dnsCheck: PropTypes.object,
  domain: PropTypes.object.isRequired,
};

export default Submission;