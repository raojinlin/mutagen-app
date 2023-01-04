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
                  <strong>SynchronizationMode_SynchronizationModeDefault</strong> represents an unspecified
                  synchronization mode. It is not valid for use with Reconcile. It should
                  be converted to one of the following values based on the desired default
                  behavior.
                </li>
                <li>
                  <strong>SynchronizationMode_SynchronizationModeTwoWaySafe</strong> represents a
                  bidirectional synchronization mode where automatic conflict resolution is
                  performed only in cases where no data would be lost. Specifically, this
                  means that modified contents are allowed to propagate to the opposite
                  endpoint if the corresponding contents on the opposite endpoint are
                  unmodified or deleted. All other conflicts are left unresolved.
                </li>
                <li>
                  <strong>SynchronizationMode_SynchronizationModeTwoWayResolved</strong> is the same as
                  SynchronizationMode_SynchronizationModeTwoWaySafe, but specifies that the
                  alpha endpoint should win automatically in any conflict between alpha and
                  beta, including cases where alpha has deleted contents that beta has
                  modified.
                </li>
                <li>
                  <strong>SynchronizationMode_SynchronizationModeOneWaySafe</strong> represents a
                  unidirectional synchronization mode where contents and changes propagate
                  from alpha to beta, but won't overwrite any creations or modifications on
                  beta.
                </li>
                <li>
                  <strong>SynchronizationMode_SynchronizationModeOneWayReplica</strong> represents a
                  unidirectional synchronization mode where contents on alpha are mirrored
                  (verbatim) to beta, overwriting any conflicting contents on beta and
                  deleting any extraneous contents on beta.
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
                  <strong>ProbeMode_ProbeModeDefault</strong> represents an unspecified probe mode. It
                  should be converted to one of the following values based on the desired
                  default behavior.
                </li>

                <li>
                  <strong>ProbeMode_ProbeModeProbe</strong> specifies that filesystem behavior should be
                  determined using temporary files or, if possible, a "fast-path" mechanism
                  (such as filesystem format detection) that provides quick but certain
                  determination of filesystem behavior.
                </li>

                <li>
                  <strong>ProbeMode_ProbeModeAssume</strong> specifies that filesystem behavior should be
                  assumed based on the underlying platform. This is not as accurate as
                  ProbeMode_ProbeModeProbe.
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
                  <strong>ScanMode_ScanModeDefault</strong> represents an unspecified scan mode. It should
                  be converted to one of the following values based on the desired default
                  behavior.
                </li>
                <li>
                  <strong>ScanMode_ScanModeFull</strong> specifies that full scans should be performed on
                  each synchronization cycle.
                </li>
                <li>
                  <strong>ScanMode_ScanModeAccelerated</strong> specifies that scans should attempt to use
                  watch-based acceleration.
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
                  <strong>StageMode_StageModeDefault</strong> represents an unspecified staging mode. It
                  should be converted to one of the following values based on the desired
                  default behavior.
                </li>
                <li>
                  <strong>StageMode_StageModeMutagen</strong> specifies that files should be staged in the
                  Mutagen data directory.
                </li>
                <li>
                  <strong>StageMode_StageModeNeighboring</strong> specifies that files should be staged in a
                  directory which neighbors the synchronization root.
                </li>
                <li>
                  <strong>StageMode_StageModeInternal</strong> specified that files should be staged in a
                  directory contained within a synchronization root. This mode will only
                  function if the synchronization root already exists.
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
                  <strong>WatchMode_WatchModeDefault</strong> represents an unspecified watch mode. It
                  should be converted to one of the following values based on the desired
                  default behavior.
                </li>
                <li>
                  <strong>WatchMode_WatchModePortable</strong> specifies that native recursive watching
                  should be used to monitor paths on systems that support it if those paths
                  fall under the home directory. In these cases, a watch on the entire home
                  directory is established and filtered for events pertaining to the
                  specified path. On all other systems and for all other paths, poll-based
                  watching is used.
                </li>
                <li>
                  <strong>WatchMode_WatchModeForcePoll</strong> specifies that only poll-based watching
                  should be used.
                </li>
                <li>
                  <strong>WatchMode_WatchModeNoWatch</strong> specifies that no watching should be used
                  (i.e. no events should be generated).
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
                <Help>
                  <ul>
                    <li>
                      <strong>IgnoreVCSMode_IgnoreVCSModeDefault</strong> represents an unspecified VCS ignore
                      mode. It is not valid for use with Scan. It should be converted to one of
                      the following values based on the desired default behavior.
                    </li>
                    <li>
                      <strong>IgnoreVCSMode_IgnoreVCSModeIgnore</strong> indicates that VCS directories should
                      be ignored.
                    </li>
                    <li>
                      <strong>IgnoreVCSMode_IgnoreVCSModePropagate</strong> indicates that VCS directories
                      should be propagated.
                    </li>
                  </ul>
                </Help>
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
                  <strong>PermissionsMode_PermissionsModeDefault</strong> represents an unspecified
                  permissions mode. It is not valid for use with Scan. It should be
                  converted to one of the following values based on the desired default
                  behavior.
                </li>
                <li>
                  <strong>PermissionsMode_PermissionsModePortable</strong> specifies that permissions should
                  be propagated in a portable fashion. This means that only executability
                  bits are managed by Mutagen and that manual specifications for ownership
                  and base file permissions are used.
                </li>
                <li>
                  <strong>PermissionsMode_PermissionsModeManual</strong> specifies that only manual
                  permission specifications should be used. In this case, Mutagen does not
                  perform any propagation of permissions.
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