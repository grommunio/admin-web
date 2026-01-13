// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2026 grommunio GmbH

import React, { useState } from "react";
import TableViewContainer from "../components/TableViewContainer";
import SpamHistory from "../components/SpamHistory";
import { useTranslation } from "react-i18next";


const Spam = () => {
  const { t } = useTranslation();
  const [snackbar, setSnackbar] = useState("");

  return (
    <TableViewContainer
      headline={t("Spam History")}
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar("")}
    >
      <div style={{ flex: 1, display: 'flex' }}>
        <SpamHistory setSnackbar={setSnackbar}/>
      </div>
    </TableViewContainer>
  );
}

Spam.propTypes = {
};

export default Spam;
