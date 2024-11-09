const { Plugin, TFile, SuggestModal } = require('obsidian');

class ExcludeSearchPlugin extends Plugin {
  async onload() {
    console.log('ExcludeSearchPlugin geladen');

    const excludedExtensions = ['txt', 'jpg', 'png'];

    // Registriere einen neuen Befehl für den angepassten Quick Switcher
    this.addCommand({
      id: 'open-excluded-quick-switcher',
      name: 'Quick Switcher ohne bestimmte Dateitypen öffnen',
      callback: () => {
        new ExcludedQuickSwitcher(this.app, excludedExtensions).open();
      }
    });
  }

  onunload() {
    console.log('ExcludeSearchPlugin entladen');
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
