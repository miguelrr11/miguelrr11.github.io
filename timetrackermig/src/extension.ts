import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

class TimeTracker {
    private primarySeconds = 0;
    private inactivitySeconds = 0;
    private isActive = false;
    private interval: NodeJS.Timeout | undefined;
    private statusBar: vscode.StatusBarItem;
    private storagePath: string;
    private idleThreshold = 20; // seconds
    

    constructor(private context: vscode.ExtensionContext) {
        this.statusBar = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );

        this.statusBar.text = "$(circle-filled)";
        this.statusBar.tooltip = "Code Time Tracker";
        this.statusBar.color = "green";
        this.statusBar.show();
        this.statusBar.command = "codeTimeTracker.showStats";


        this.storagePath = path.join(
            context.globalStorageUri.fsPath,
            "time-data.json"
        );

        vscode.commands.registerCommand(
            "codeTimeTracker.showStats",
            () => tracker.showStats()
        );


        if (!fs.existsSync(context.globalStorageUri.fsPath)) {
            fs.mkdirSync(context.globalStorageUri.fsPath, { recursive: true });
        }

        this.startLoop();
        this.registerActivityListeners();
    }

    private startLoop() {
        this.interval = setInterval(() => {
            this.inactivitySeconds++;

            if (this.inactivitySeconds < this.idleThreshold) {
                this.primarySeconds++;
                this.setActive(true);
            } else {
                this.setActive(false);
            }
        }, 1000);
    }

    private registerActivityListeners() {
        const reset = () => {
            this.inactivitySeconds = 0;
        };

        vscode.workspace.onDidChangeTextDocument(reset);
        vscode.window.onDidChangeTextEditorSelection(reset);
        vscode.window.onDidChangeActiveTextEditor(reset);
        vscode.window.onDidChangeWindowState(state => {
            if (!state.focused) {
                this.inactivitySeconds = this.idleThreshold;
            }
        });
    }

    private setActive(active: boolean) {
        this.isActive = active;
        this.statusBar.color = active ? "green" : "red";
    }

    public async showStats() {
        await this.saveToday();

        const data = this.readData();
        const today = this.getTodayKey();
        const todaySeconds = data[today] || 0;

        const todayFormatted = this.formatTime(todaySeconds);

        vscode.window.showInformationMessage(
            `Today: ${todayFormatted}`
        );
    }

    private async saveToday() {
        const data = this.readData();
        const today = this.getTodayKey();

        if (!data[today]) {
            data[today] = 0;
        }

        data[today] += this.primarySeconds;
        this.primarySeconds = 0;

        fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    }

    private readData(): Record<string, number> {
        if (!fs.existsSync(this.storagePath)) {
            return {};
        }
        const raw = fs.readFileSync(this.storagePath, 'utf-8');
        return JSON.parse(raw);
    }

    private getTodayKey(): string {
        const now = new Date();
        return now.toISOString().split("T")[0];
    }

    private formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    }

    public dispose() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.saveToday();
    }
}

let tracker: TimeTracker;

export function activate(context: vscode.ExtensionContext) {
    console.log("Code Time Tracker Activated");


    tracker = new TimeTracker(context);

    const disposable = vscode.commands.registerCommand(
        "codeTimeTracker.showStats",
        () => tracker.showStats()
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (tracker) {
        tracker.dispose();
    }
}
