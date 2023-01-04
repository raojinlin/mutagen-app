import React from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Box, List, ListItem, Typography} from "@mui/material";
import {ExpandMore} from "@mui/icons-material";

/**
 * @typedef {Object} Configuration
 * @property {string} synchronizationMode 
 * @property {number} maximumEntryCount
 * @property {number} maximumStagingFileSize
 * @property {string} probeMode
 * @property {string} scanMode
 * @property {string} stageMode
 * @property {string} watchMode 
 * @property {number} watchPollingInterval
 * @property {[string]} ignores
 * @property {string} ignoreVCSMode
 * @property {string} permissionMode
 * @property {number} defaultFileMode
 * @property {number} defaultDirectoryMode
 * @property {string} defaultOwner
 * @property {string} defaultGroup
 */

/**
 * @param configuration {Configuration}
 * @constructor
 */

export default function Overview({ configuration }) {
  const keys = Object.keys(configuration);
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        查看配置
      </AccordionSummary>
      <AccordionDetails>
        <List 
          style={{padding: 0}}
          sx={{
            '&': {
              padding: 0,
            },
            '& .MuiListItem-root': {
              paddingTop: 0
            }
          }}
        >
          {keys.map(key => {
            if (!configuration[key]) return null;

            return <ListItem>{key}: {configuration[key]}</ListItem>
          })}
        </List>
      </AccordionDetails>
    </Accordion>
  );
}