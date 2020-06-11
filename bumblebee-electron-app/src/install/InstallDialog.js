import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
// import FormLabel from '@material-ui/core/FormLabel';
// import FormGroup from '@material-ui/core/FormGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormHelperText from '@material-ui/core/FormHelperText';
// import Checkbox from '@material-ui/core/Checkbox';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

// const useStyles = makeStyles((theme) => ({
// 	form: {
// 		// display: 'flex',
// 		// flexDirection: 'column',
// 		margin: 'auto',
// 		width: '100%'
// 	},
// 	formControl: {
// 		margin: theme.spacing(1),
// 		// minWidth: 180,
// 		width: '100%'
// 	},
// 	selectEmpty: {
// 		marginTop: theme.spacing(2),
// 	},
// }));

const ipcRenderer = window.ipcRenderer;

const styles = (theme) => ({
	root: {
		margin: 0,
		padding: theme.spacing(2),
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500],
	}
});

const DialogTitle = withStyles(styles)((props) => {
	const { children, classes, onClose, ...other } = props;
	return (
		<MuiDialogTitle disableTypography className={classes.root} {...other}>
			<Typography variant="h6">{children}</Typography>
			{onClose ? (
				<IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
					<CloseIcon />
				</IconButton>
			) : null}
		</MuiDialogTitle>
	);
});

const DialogContent = withStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
	},
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
	root: {
		margin: 0,
		padding: theme.spacing(1),
	},
}))(MuiDialogActions);

export default function InstallDialog(props) {
	
	const [installing, setInstalling] = React.useState(false);
	const [installed, setInstalled] = React.useState(false);
	
	const [downloadingFile1, setDownloading1] = React.useState(false);
	const [file1percent, setfile1percent] = React.useState(0);
	
	const [downloadingFile2, setDownloading2] = React.useState(false);
	const [file2percent, setfile2percent] = React.useState(0);
	
	window.speechDownloadProgress = function(file_num, received_bytes, total_bytes, done) {
		
		if (file_num === 1) {
			setDownloading1(true);
			if (received_bytes && total_bytes) {
				setfile1percent(Math.round(100 * received_bytes / total_bytes));
			}
		}
		if (file_num === 2) {
			setDownloading2(true);
			if (received_bytes && total_bytes) {
				setfile2percent(Math.round(100 * received_bytes / total_bytes));
			}
		}
		
		if (done) {
			setInstalled(true);
			props.onInstalled();
		}
	}
	
	const handleClickInstall = () => {
		// setOpen(false);
		setInstalling(true);
		ipcRenderer.send('download-deepspeech');
	};
	
	const handleCancel = () => {
		// setOpen(false);
		ipcRenderer.send('download-deepspeech-cancel');
		props.onCancel();
	};
	
	// const classes = useStyles();
	
	let content;
	
	if (installed) {
		content = (<DialogContent dividers>
			
			<Typography gutterBottom>
				Installation complete.
			</Typography>
			
		</DialogContent>);
	}
	else if (installing) {
		content = (<DialogContent dividers>
			
			<Typography gutterBottom>
				Installing...
			</Typography>
			
			<Typography gutterBottom>
				Downloading File 1: {file1percent} %
			</Typography>
			<Typography gutterBottom>
				Downloading File 2: {file2percent} %
			</Typography>
		
		</DialogContent>);

	}
	else {
		content = (<DialogContent dividers>
			
			<Typography gutterBottom>
				<a href="https://github.com/mozilla/DeepSpeech" target="_new">Mozilla DeepSpeech</a> is an open source speech recognition system.
			</Typography>
			
			<Typography gutterBottom>
				1.14GB of disk space is required.
			</Typography>
		
		</DialogContent>);
	}
	
	
	return (
		<div>
			<Dialog aria-labelledby="customized-dialog-title" open={true} fullWidth={true}>
				<DialogTitle id="customized-dialog-title" onClose={handleCancel}>
					Install DeepSpeech
				</DialogTitle>
				{ content }
				<DialogActions>
					<Button onClick={handleCancel} color="primary">
						Cancel
					</Button>
					<Button disabled={installing} autoFocus onClick={handleClickInstall} color="primary">
						Install
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
