const { Plugin, TFile, SuggestModal, PluginSettingTab, Setting } = require('obsidian');

const DEFAULT_SETTINGS = {
  excludedExtensions: 'txt,jpg,png' // Standardmäßig auszuschließende Dateiendungen
};

class ExcludeSearchPlugin extends Plugin {
  async onload() {
    console.log('ExcludeSearchPlugin geladen');

    // Einstellungen laden
    await this.loadSettings();

    // Registriere die Einstellungs-Registerkarte
    this.addSettingTab(new ExcludeSearchSettingTab(this.app, this));

    // Registriere einen neuen Befehl für den angepassten Quick Switcher
    this.addCommand({
      id: 'open-excluded-quick-switcher',
      name: 'Quick Switcher ohne bestimmte Dateitypen öffnen',
      callback: () => {
        const excludedExtensions = this.settings.excludedExtensions.split(',').map(ext => ext.trim());
        new ExcludedQuickSwitcher(this.app, excludedExtensions).open();
      }
    });
  }

  onunload() {
    console.log('ExcludeSearchPlugin entladen');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ExcludeSearchSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Einstellungen für Exclude Search Extensions' });

    new Setting(containerEl)
      .setName('Auszuschließende Dateiendungen')
      .setDesc('Geben Sie die Dateiendungen an, die ausgeschlossen werden sollen, getrennt durch Kommas (z.B. txt,jpg,png)')
      .addText(text => text
        .setPlaceholder('txt,jpg,png')
        .setValue(this.plugin.settings.excludedExtensions)
        .onChange(async (value) => {
          this.plugin.settings.excludedExtensions = value;
          await this.plugin.saveSettings();
        }));

    // Neuer Button zum Ausschließen aller Dateiendungen außer .md
    new Setting(containerEl)
      .setName('Alle Dateiendungen außer .md ausschließen')
      .setDesc('Klicken Sie auf diesen Button, um alle Dateiendungen außer .md auszuschließen.')
      .addButton(button => button
        .setButtonText('Alle außer .md ausschließen')
        .setCta()
        .onClick(async () => {
          // Sammle alle Dateiendungen im Vault
          const files = this.app.vault.getFiles();
          const extensions = new Set(files.map(file => file.extension));
          extensions.delete('md'); // Entferne 'md' aus der Liste

          // Aktualisiere die Einstellungen
          this.plugin.settings.excludedExtensions = Array.from(extensions).join(',');
          await this.plugin.saveSettings();

          // Aktualisiere die Anzeige der Einstellungen
          this.display();
        }));

    // Hinweis zum Aktivieren des Shortcuts
    containerEl.createEl('h3', { text: 'Anleitung' });
    containerEl.createEl('p', { text: 'Um den Quick Switcher zu aktivieren, gehe zu <code>Einstellungen</code> → Optionen → Tastenkürzel, suche nach "Quick Switcher ohne bestimmte Dateitypen öffnen" und weise ihm einen Hotkey zu (z.B. Strg+O oder Strg+Shift+F).' });
  }
}

class ExcludedQuickSwitcher extends SuggestModal {
  constructor(app, excludedExtensions) {
    super(app);
    this.excludedExtensions = excludedExtensions;
  }

  getSuggestions(query) {
    const files = this.app.vault.getFiles();

    // Filtere Dateien basierend auf der Abfrage und den auszuschließenden Endungen
    const filteredFiles = files.filter(file => {
      const extension = file.extension;
      if (this.excludedExtensions.includes(extension)) {
        return false;
      }
      return file.basename.toLowerCase().includes(query.toLowerCase());
    });

    return filteredFiles;
  }

  renderSuggestion(file, el) {
    el.createEl('div', { text: file.path });
  }

  onChooseSuggestion(file, evt) {
    this.app.workspace.openLinkText(file.path, file.path);
  }
}

module.exports = ExcludeSearchPlugin;
