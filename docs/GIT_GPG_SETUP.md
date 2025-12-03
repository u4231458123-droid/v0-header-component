# Git GPG-Signatur Setup - MyDispatch

**Datum:** 2025-01-03  
**Status:** ✅ Konfiguriert

---

## 🔐 GPG-Konfiguration

### GPG-Key Informationen

- **E-Mail:** courbois1981@gmail.com
- **Key ID:** DBC5BAE0DF928841
- **Subkeys:** C56B051BCC3EFF21
- **Hinzugefügt:** 3. November 2025

---

## ✅ Git-Konfiguration

Die Git-Konfiguration wurde in `.git/config` gesetzt:

```ini
[user]
	name = MyDispatch
	email = courbois1981@gmail.com
	signingkey = DBC5BAE0DF928841
[commit]
	gpgsign = true
[gpg]
	program = gpg
```

---

## 📝 Verifizierung

### GPG-Key prüfen

```bash
gpg --list-secret-keys --keyid-format LONG
```

Sollte zeigen:
```
sec   rsa4096/DBC5BAE0DF928841 2025-11-03 [SC]
      [Fingerprint]
uid                 [ultimate] courbois1981@gmail.com
ssb   rsa4096/C56B051BCC3EFF21 2025-11-03 [E]
```

### Git-Konfiguration prüfen

```bash
git config --list | grep -E "(user|gpg|sign)"
```

Sollte zeigen:
```
user.name=MyDispatch
user.email=courbois1981@gmail.com
user.signingkey=DBC5BAE0DF928841
commit.gpgsign=true
gpg.program=gpg
```

---

## ✅ Test

### Test-Commit mit Signatur

```bash
git commit --allow-empty -m "Test: GPG-Signatur"
```

Der Commit sollte jetzt signiert sein. Prüfen mit:

```bash
git log --show-signature -1
```

---

## 🔒 Sicherheit

- ✅ Alle Commits werden automatisch signiert
- ✅ GPG-Key ist mit E-Mail verknüpft
- ✅ GitHub kann die Signatur verifizieren

---

**Status:** ✅ Konfiguriert und aktiv

