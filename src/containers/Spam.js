// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2020-2024 grommunio GmbH

import React, { useState } from "react";
import TableViewContainer from "../components/TableViewContainer";
import { Paper, Tab, Tabs } from "@mui/material";
import SpamDonut from "../components/charts/SpamDonut";
import SpamHistory from "../components/SpamHistory";
import { useTranslation } from "react-i18next";


const Spam = () => {
  const { t } = useTranslation();
  const [snackbar, setSnackbar] = useState("");
  const [tab, setTab] = useState(0);

  const handleTabs = (_, tab) => setTab(tab);

  return (
    <TableViewContainer
      headline={t("Spam")}
      snackbar={snackbar}
      onSnackbarClose={() => setSnackbar("")}
    >
      <Tabs sx={{ ml: 2 }} value={tab} onChange={handleTabs}>
        <Tab label="Status" />
        <Tab label="History" />
      </Tabs>
      {tab === 0 && <Paper>
        <SpamDonut setSnackbar={setSnackbar}/>
      </Paper>}
      {tab === 1 && <SpamHistory setSnackbar={setSnackbar}/>}
    </TableViewContainer>
  );
}

Spam.propTypes = {
};

export default Spam;
