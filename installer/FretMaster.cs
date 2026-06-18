using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace FretMaster
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string appDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            string serverPath = Path.Combine(appDir, "server.js");
            string nodePath = FindNodeExecutable();

            if (nodePath == null)
            {
                MessageBox.Show(
                    "Node.js is required to run FretMaster.\n\n" +
                    "Please install Node.js from: https://nodejs.org\n\n" +
                    "After installing, restart FretMaster.",
                    "FretMaster - Node.js Required",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            if (!File.Exists(serverPath))
            {
                MessageBox.Show(
                    "Server files not found.\n\n" +
                    "Please ensure server.js is in the same directory as FretMaster.exe",
                    "FretMaster - Files Missing",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            // Start the server
            try
            {
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = nodePath,
                    Arguments = "\"" + serverPath + "\"",
                    WorkingDirectory = appDir,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                Process serverProcess = Process.Start(startInfo);
                int actualPort = 3000;

                // Read stdout line by line to find the actual port
                DateTime portTimeout = DateTime.Now.AddSeconds(5);
                while (!serverProcess.HasExited && DateTime.Now < portTimeout)
                {
                    string line = serverProcess.StandardOutput.ReadLine();
                    if (line == null) break;
                    if (line.StartsWith("FRETMASTER_PORT="))
                    {
                        int.TryParse(line.Substring("FRETMASTER_PORT=".Length).Trim(), out actualPort);
                        break;
                    }
                }

                // Open browser
                Process.Start(new ProcessStartInfo
                {
                    FileName = "http://localhost:" + actualPort,
                    UseShellExecute = true
                });

                // Show tray icon
                Application.Run(new FretMasterTrayIcon(serverProcess, actualPort));
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Error starting FretMaster:\n\n" + ex.Message,
                    "FretMaster - Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        static string FindNodeExecutable()
        {
            // Check common locations
            string[] possiblePaths = new string[]
            {
                @"C:\Program Files\nodejs\node.exe",
                @"C:\Program Files (x86)\nodejs\node.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Programs\nodejs\node.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"nodejs\node.exe")
            };

            foreach (string path in possiblePaths)
            {
                if (File.Exists(path))
                    return path;
            }

            // Try to find in PATH
            string pathEnv = Environment.GetEnvironmentVariable("PATH") ?? "";
            string[] paths = pathEnv.Split(';');
            foreach (string dir in paths)
            {
                string nodePath = Path.Combine(dir.Trim(), "node.exe");
                if (File.Exists(nodePath))
                    return nodePath;
            }

            return null;
        }
    }

    public class FretMasterTrayIcon : ApplicationContext
    {
        private NotifyIcon trayIcon;
        private Process serverProcess;
        private int port;

        public FretMasterTrayIcon(Process process, int actualPort)
        {
            serverProcess = process;
            port = actualPort;

            trayIcon = new NotifyIcon
            {
                Icon = SystemIcons.Application,
                Text = "FretMaster - Running on port " + port,
                Visible = true,
                ContextMenuStrip = new ContextMenuStrip()
            };

            trayIcon.ContextMenuStrip.Items.Add("Open FretMaster", null, (s, e) => OpenBrowser());
            trayIcon.ContextMenuStrip.Items.Add("-");
            trayIcon.ContextMenuStrip.Items.Add("Exit", null, (s, e) => Exit());

            trayIcon.DoubleClick += (s, e) => OpenBrowser();

            trayIcon.ShowBalloonTip(3000, "FretMaster", "Server started at http://localhost:" + port, ToolTipIcon.Info);
        }

        void OpenBrowser()
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = "http://localhost:" + port,
                UseShellExecute = true
            });
        }

        void Exit()
        {
            if (serverProcess != null && !serverProcess.HasExited)
            {
                serverProcess.Kill();
            }
            trayIcon.Visible = false;
            Application.Exit();
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (trayIcon != null) trayIcon.Dispose();
                if (serverProcess != null) serverProcess.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}