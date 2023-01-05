import React from 'react';
import {
  FormGroup,
  FormLabel,
  FormControl,
  TextField,
  Select,
  MenuItem,
  ListItem,
  FormHelperText, Checkbox, FormControlLabel
} from '@mui/material';
import pick from 'lodash/pick';
import MultipleItemInput from "./MultipleItemInput";
import Help from "../help";

const SYNCHRONIZATION_MODE = {
  "SynchronizationModeDefault":        'two-way-safe',
  "SynchronizationModeTwoWaySafe":     'two-way-safe',
  "SynchronizationModeTwoWayResolved": 'two-way-resolved',
  "SynchronizationModeOneWaySafe":     'one-way-safe',
  "SynchronizationModeOneWayReplica":  'one-way-replica',
};

const PROBE_MODE = {
  "ProbeModeDefault": 'probe',
  "ProbeModeProbe":   'probe',
  "ProbeModeAssume":  'assume',
};

const SCAN_MODE = {
  "ScanModeDefault":     'full',
  "ScanModeFull":        'full',
  "ScanModeAccelerated": 'accelerated',
};

const STAGE_MODE = {
  "StageModeDefault":     'mutagen',
  "StageModeMutagen":     'mutagen',
  "StageModeNeighboring": 'neighboring',
  "StageModeInternal":    'internal',
};

const WATCH_MODE = {
  "WatchModePortable":  "portable",
  "WatchModeForcePoll": "force-poll",
  "WatchModeNoWatch":   "no-watch",
};

const IGNORE_VCS_MODE = {
  "IgnoreVCSModeDefault":   "IgnoreVCSModeDefault",
  "IgnoreVCSModeIgnore":    "IgnoreVCSModeIgnore",
  "IgnoreVCSModePropagate": "IgnoreVCSModePropagate",
};

const PERMISSION_MODE = {
  "PermissionsModeDefault":  'portable',
  "PermissionsModePortable": 'portable',
  "PermissionsModeManual":   'manual',
};

const isPropertyShow = (property, properties) => {
  if (!properties || !properties.length) return true;
  
  return properties.includes(property);
}

export default function Configuration({ configuration, onChange, properties=[]  }) {
  const [config, setConfig] = React.useState(configuration || {
    synchronizationMode: SYNCHRONIZATION_MODE.SynchronizationModeDefault,
    maximumEntryCount: 0,
    maximumStagingFileSize: 0,
    probeMode: PROBE_MODE.ProbeModeDefault,
    scanMode: SCAN_MODE.ScanModeDefault,
    stageMode: STAGE_MODE.StageModeDefault,
    watchMode: WATCH_MODE.WatchModePortable,
    watchPollingInterval: undefined,
    ignores: [],
    ignoreVCSMode: false,
    permissionMode: PERMISSION_MODE.PermissionsModeDefault,
    defaultFileMode: 0,
    defaultDirectoryMode: 0,
    defaultOwner: '',
    defaultGroup: '',
  });
  
  const updateConfig = React.useCallback(newConfig => {
    newConfig = (!properties || !properties.length) ? newConfig : pick(newConfig, properties);
    setConfig(newConfig);
    if (onChange) {
      onChange(newConfig);
    }
  }, [config, onChange, properties]);
  
  return (
    <FormGroup 
      sx={{
        '& .MuiFormControl-root': {
          marginBottom: '10px',
        }
      }}
    >
      {isPropertyShow('synchronizationMode', properties) ? (
        <FormControl>
          <FormLabel>
            同步模式
            <Help>
              <ul>
                <li>
                  <strong>Two Way Safe</strong>
                  表示双向同步模式，其中仅在不会丢失数据的情况下才执行自动冲突解决。
                  具体来说，这意味着如果对端点上的相应内容未被修改或删除，则允许修改的内容传播到对端点。
                  所有其他冲突都没有解决。
                </li>
                <li>
                  <strong>Two Way Resolved</strong>
                  与 TwoWaySafe 相同，但指定 alpha 端点应在 alpha 和 beta 之间的任何冲突中自动获胜，包括 alpha 删除了 beta 修改的内容的情况。
                </li>
                <li>
                  <strong>One Way Safe</strong> 表示一种单向同步模式，其中内容和更改从 alpha 传播到 beta，但不会覆盖 beta 上的任何创建或修改。
                </li>
                <li>
                  <strong>One Way Replica</strong> 表示单向同步模式，其中 alpha 上的内容被（逐字）镜像到 beta，覆盖 beta 上的任何冲突内容并删除 beta 上的任何无关内容。
                </li>
              </ul>
            </Help>
          </FormLabel>
          <Select value={config.synchronizationMode} onChange={e => updateConfig({...config, synchronizationMode: e.target.value})}>
            <MenuItem value={SYNCHRONIZATION_MODE.SynchronizationModeTwoWaySafe}>Two way safe</MenuItem>
            <MenuItem value={SYNCHRONIZATION_MODE.SynchronizationModeTwoWayResolved}>Two way resolved</MenuItem>
            <MenuItem value={SYNCHRONIZATION_MODE.SynchronizationModeOneWaySafe}>One way safe</MenuItem>
            <MenuItem value={SYNCHRONIZATION_MODE.SynchronizationModeOneWayReplica}>One way replica</MenuItem>
          </Select>
          <FormHelperText>指定同步中应使用的同步模式。</FormHelperText>
        </FormControl>
      ) : null}
      {isPropertyShow('maximumEntryCount', properties) ? (
        <FormControl>
          <FormLabel>
            最大条目数
          </FormLabel>
          <TextField
            type='number'
            value={config.maximumEntryCount}
            onChange={e => updateConfig({...config, maximumEntryCount: parseInt(e.target.value, 10)})}
            helperText='指定端点允许管理的最大文件系统条目数。零值表示没有限制。'
          />
        </FormControl>
      ) : null}
      {isPropertyShow('maximumStagingFileSize', properties) ? (
        <FormControl>
          <FormLabel>最大暂存大小</FormLabel>
          <TextField
            type='number'
            helperText='端点将暂存的最大（单个）文件大小。零值表示没有限制。'
            value={config.maximumStagingFileSize}
            onChange={e => updateConfig({...config, maximumStagingFileSize: parseInt(e.target.value, 10)})}
          />
        </FormControl>
      ) : null}
      {isPropertyShow('probeMode', properties) ? (
        <FormControl>
          <FormLabel>
            探测模式
            <Help>
              <ul>
                <li>
                  <strong>Probe</strong>
                  指定文件系统行为应该使用临时文件来确定，或者如果可能的话，使用“快速路径”机制（例如文件系统格式检测）来提供快速但确定的文件系统行为确定。
                </li>

                <li>
                  <strong>Assume</strong> 指定应基于底层平台假定文件系统行为。 这不如 Probe 准确。
                </li>
              </ul>
            </Help>
          </FormLabel>
          <Select value={config.probeMode} onChange={e => updateConfig({...config, probeMode: e.target.value})}>
            <MenuItem value={PROBE_MODE.ProbeModeAssume}>Assume</MenuItem>
            <MenuItem value={PROBE_MODE.ProbeModeProbe}>Probe</MenuItem>
          </Select>
        </FormControl>
      ) : null}
      {isPropertyShow('scanMode', properties) ? (
        <FormControl>
          <FormLabel>
            扫描模式
            <Help>
              <ul>
                <li>
                  <strong>Full</strong> 指定应在每个同步周期执行完整扫描。
                </li>
                <li>
                  <strong>Accelerated</strong> 指定扫描应尝试使用基于监视的加速。
                </li>
              </ul>
            </Help>
          </FormLabel>
          <Select value={config.scanMode} onChange={e => updateConfig({...config, scanMode: e.target.value})}>
            <MenuItem value={SCAN_MODE.ScanModeAccelerated}>Accelerated</MenuItem>
            <MenuItem value={SCAN_MODE.ScanModeFull}>Full</MenuItem>
          </Select>
        </FormControl>
      ) : null}
      {isPropertyShow('stageMode', properties) ? (
        <FormControl>
          <FormLabel>
            暂存模式
            <Help>
              <ul>
                <li>
                  <strong>Mutagen</strong>指定文件应暂存在 Mutagen 数据目录中。
                </li>
                <li>
                  <strong>Neighboring</strong> 指定文件应暂存在同步根附近的目录中。
                </li>
                <li>
                  <strong>Internal</strong> 指定文件应暂存在同步根中包含的目录中。 这种模式只有在同步根已经存在的情况下才会起作用。
                </li>
              </ul>
            </Help>
          </FormLabel>
          <Select value={config.stageMode} onChange={e => updateConfig({...config, stageMode: e.target.value})}>
            <MenuItem value={STAGE_MODE.StageModeInternal}>Internal</MenuItem>
            <MenuItem value={STAGE_MODE.StageModeMutagen}>Mutagen</MenuItem>
            <MenuItem value={STAGE_MODE.StageModeNeighboring}>Neighboring</MenuItem>
          </Select>
        </FormControl>
      ) : null}
      {isPropertyShow('watchMode', properties) ? (
        <FormControl>
          <FormLabel>
            监听模式
            <Help>
              <ul>
                <li>
                  <strong>Portable</strong> 
                  指定应使用本机递归监视来监视支持它的系统上的路径（如果这些路径位于主目录下）。
                  在这些情况下，将建立对整个主目录的监视并过滤与指定路径有关的事件。
                  在所有其他系统和所有其他路径上，使用基于轮询的监视。
                </li>
                <li>
                  <strong>ForcePoll</strong>
                  指定仅应使用基于轮询的监视。
                </li>
                <li>
                  <strong>NoWatch</strong> 指定不应使用监视（即不应生成任何事件）。
                </li>
              </ul>
            </Help>
          </FormLabel>
          <Select value={config.watchMode} onChange={e => updateConfig({...config, watchMode: e.target.value})}>
            <MenuItem value={WATCH_MODE.WatchModeNoWatch}>NoWatch</MenuItem>
            <MenuItem value={WATCH_MODE.WatchModeForcePoll}>ForcePoll</MenuItem>
            <MenuItem value={WATCH_MODE.WatchModePortable}>Portable</MenuItem>
          </Select>
        </FormControl>
      ) : null}
      {isPropertyShow('watchPollingInterval', properties) ? (
        <FormControl>
          <FormLabel>监听轮询间隔</FormLabel>
          <TextField
            type='number'
            value={config.watchPollingInterval}
            onChange={e => updateConfig({...config, watchPollingInterval: parseInt(e.target.value, 10)})}
          />
          <FormHelperText>
            指定基于轮询的文件监视的间隔（以秒为单位）。值0指定应使用默认间隔。
          </FormHelperText>
        </FormControl>
      ) : null}
      {isPropertyShow('ignores', properties) ? (
        <MultipleItemInput
          value={config.ignores}
          label='忽略目录'
          helperText={'指定从创建请求引入的忽略模式。'}
          onChange={ignores => updateConfig({...config, ignores})}
        />
      ) : null}
      {isPropertyShow('ignoreVCSMode', properties) ? (
        <FormControl>
          <FormControlLabel
            control={(
              <Checkbox
                checked={config.ignoreVCSMode}
                onChange={e => updateConfig({...config, ignoreVCSMode: e.target.checked})}
              />
            )}
            label={(
              <>
                忽略版本控制文件
              </>
            )}
          />
        </FormControl>
      ) : null}
      {isPropertyShow('permissionMode', properties) ? (
        <FormControl>
          <FormLabel>
            权限模式
            <Help>
              <ul>
                <li>
                  <strong>Portable</strong> 
                  指定应以可移植的方式传播权限。 这意味着只有可执行位由 Mutagen 管理，并且使用所有权和基本文件权限的手动规范。
                </li>
                <li>
                  <strong>Manual</strong>
                  指定仅应使用手动权限规范。 在这种情况下，Mutagen 不会执行任何权限传播。
                </li>
              </ul>
            </Help>
          </FormLabel>
          <Select value={config.permissionMode} onChange={e => updateConfig({...config, permissionMode: e.target.value})}>
            <MenuItem value={PERMISSION_MODE.PermissionsModeManual}>Manual</MenuItem>
            <MenuItem value={PERMISSION_MODE.PermissionsModePortable}>Portable</MenuItem>
          </Select>
        </FormControl>
      ) : null}
      {isPropertyShow('defaultFileMode', properties) ? (
        <FormControl>
          <FormLabel>文件权限</FormLabel>
          <TextField
            type={'number'}
            value={config.defaultFileMode}
            onChange={e => updateConfig({...config, defaultFileMode: parseInt(e.target.value, 10)})}
            helperText={"指定在“可移植”权限传播模式下用于新文件的默认权限模式。"}
          />
        </FormControl>
      ) : null}
      {isPropertyShow('defaultDirectoryMode', properties) ? (
        <FormControl>
          <FormLabel>目录权限</FormLabel>
          <TextField
            type={'number'}
            value={config.defaultDirectoryMode}
            onChange={e => updateConfig({...config, defaultDirectoryMode: parseInt(e.target.value, 10)})}
            helperText={'指定在“可移植”权限传播模式下用于新文件的默认权限模式。'}
          />
        </FormControl>
      ) : null}
      {isPropertyShow('defaultOwner', properties) ? (
        <FormControl>
          <FormLabel>所属者</FormLabel>
          <TextField
            value={config.defaultOwner}
            onChange={e => updateConfig({...config, defaultOwner: e.target.value})}
            helperText={'指定在“可移植”权限传播模式下设置新文件和目录的所有权时要使用的默认所有者标识符。'}
          />
        </FormControl>
      ) : null}
      {isPropertyShow('defaultGroup', properties) ? (
        <FormControl>
          <FormLabel>所属组</FormLabel>
          <TextField
            value={config.defaultGroup}
            onChange={e => updateConfig({...config, defaultGroup: e.target.value})}
            helperText={
              '指定在“可移植”权限传播模式下设置新文件和目录的所有权时要使用的默认组标识符。'
            }
          />
        </FormControl>
      ) : null}
    </FormGroup>
  );
}