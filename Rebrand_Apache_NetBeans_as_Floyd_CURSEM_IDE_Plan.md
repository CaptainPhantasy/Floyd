Here is the completely recreated plan, updated with the specific color palette from your image, the correct "Legacy AI" branding hierarchy, and strict protocols for build testing and error correction.Rebrand Apache NetBeans as Floyd CURSE'M IDE - Complete Plan⚠️ MASTER PROTOCOL: The "Build & Fix" LoopCRITICAL INSTRUCTION: To prevent "drift" and unmanageable bugs, you must adhere to the following cycle for every single file edit. Do not batch edits.Edit: Modify a single file or asset.Build: Run ant build immediately.Fix: Stop. Do not proceed. Fix any Java or TypeScript syntax errors immediately.Verify: Launch the IDE (./nbbuild/netbeans/bin/netbeans) to visually confirm the change.Commit: Only move to the next step once the build is green.Executive SummaryThis document provides a comprehensive step-by-step plan to rebrand Apache NetBeans as Floyd CURSE'M IDE, a product of Legacy AI. The rebranding will transform the visual identity to match the specific "Floyd CLI" aesthetic (Deep Void/Neon), update UI components, and establish Legacy AI as the parent organization while maintaining the core functionality of the IDE.Table of ContentsProject OverviewDesign AnalysisTechnical ArchitectureRebranding Implementation PlanAsset InventoryLegal & Licensing ConsiderationsTesting & ValidationTimeline & MilestonesProject OverviewObjectivesPrimary: Rebrand Apache NetBeans as Floyd CURSE'M IDE with the custom "Legacy AI" visual identity.Secondary: Enforce the "Cyber-Industrial" aesthetic (Deep Void backgrounds, Electric Purple accents).Tertiary: Establish proper attribution: Product = Floyd CURSE'M IDE, Parent Brand = Legacy AI.ScopeThe rebranding covers:Visual identity (logo, specific hex palette, typography).UI components and themes (Look and Feel).Application assets (splash screens, icons, about dialogs).Installer and bundle configuration (macOS/Windows/Linux).Design AnalysisFloyd CLI / Legacy AI Design LanguageBased on the Floyd CLI Screen Palette provided, the following specific hex codes MUST be used.Color PaletteElementColor NameHex CodeUsageBackground PrimaryThe Void#0E111AMain window background, editor backgroundBackground SecondaryDeep Indigo#1C165ESidebars, Project panels, Explorer viewsAccent PrimaryElectric Purple#AB18E4Primary buttons, active tabs, caretAccent SecondaryElectric Blue#371DF4Focus states, secondary selectionAccent TertiaryMagenta Glow#A015A7Number highlighting, special keywordsSelectionBright Neon#561DFFText selection backgroundBordersDark Blue#231991Splitters, panel dividersText PrimaryWhite#ffffffPrimary code and UI textText SecondaryMuted Gray#5C5B62Comments, line numbers, disabled textTypographyPrimary Font: JetBrains Mono or similar monospace.UI Font: Inter or System Default (San Francisco/Segoe UI).Design PatternsHigh Contrast: Deep black/purple backgrounds with neon accents.Legacy AI Branding: "Legacy AI" must appear as the parent authority (e.g., "A Legacy AI Product").Technical ArchitectureApache NetBeans StructurePlaintextnbbuild/                    # Build scripts
  └── ant/
      └── build.xml         # Main build file

nb/                         # Core NetBeans Platform
  ├── branding/             # Core branding modules
  │   └── modules/
  │       └── core/
  │           └── core.jar  # Branding resources (Splash, Icons)
  │
  ├── ide/                  # IDE-specific modules
  │   └── branding/
  │       └── modules/
  │           └── ide/
  │               └── ide.jar # IDE branding (About box, Welcome)
Rebranding Implementation PlanPhase 1: Setup & Preparation (Days 1-2)Step 1.1: Environment SetupBash# Clone Apache NetBeans repository
git clone https://github.com/apache/netbeans.git floyd-cursem-ide
cd floyd-cursem-ide

# Install dependencies (macOS example)
brew install ant
brew install openjdk@21

# Set environment variables
export ANT_HOME=/usr/local/opt/ant
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
Step 1.2: Initial Build TestBash# Build NetBeans (Check for errors immediately)
ant build

# Test the build
./nbbuild/netbeans/bin/netbeans
Step 1.3: Create Branding Directory StructureBashmkdir -p floyd-branding/core
mkdir -p floyd-branding/ide
mkdir -p floyd-branding/themes
mkdir -p floyd-branding/icons
Phase 2: Visual Asset Creation (Days 3-7)Step 2.1: Create Logo SuiteCreate variants ensuring Legacy AI is cited as the parent brand.AssetDimensionsDescriptionApp Icon256x256px"Floyd" logo. Minimalist.Splash Screen600x400pxBig "Floyd CURSE'M" logo. Subtext: "Legacy AI". Background: #0E111A.About Image600x400pxdetailed credits, "Copyright 2026 Legacy AI".Step 2.4: Create UI Theme Assets (CRITICAL COLOR UPDATE)File: floyd-branding/themes/FloydDark.themeCSS# Floyd CURSE'M IDE - Legacy AI Official Theme
# Palette Source: Floyd CLI Screen Palette

## Primary Backgrounds (The Void)
background=#0E111A
# Deepest black/purple from background

## Secondary Backgrounds (Panels/Sidebars)
background_secondary=#1C165E
# Deep Indigo from side panels

## Text Colors
foreground=#ffffff
foreground_secondary=#5C5B62
# Muted gray from palette for subtitles/comments

## Accent Colors (Neon)
accent_primary=#AB18E4
# Electric Purple (Primary Action)
accent_secondary=#371DF4
# Electric Blue (Secondary Action/Focus)

## UI Elements
selection_background=#561DFF
# Bright Blue/Purple for selections
selection_foreground=#ffffff
caret_color=#AB18E4

## Borders & Dividers
border_color=#231991
# Dark Blue/Purple for subtle separation

## Syntax Highlighting (Mapped to Palette)
keyword=#AB18E4
string=#371DF4
comment=#5C5B62
number=#A015A7
operator=#ffffff
Phase 3: Core Branding Changes (Days 8-12)REMINDER: Run ant build after editing these properties.Step 3.1: Modify Core Branding PropertiesFile: nb/branding/modules/core/core.jar/org/netbeans/core/startup/Bundle.propertiesProperties# Branding Titles
LBL_splash_window_title=Floyd CURSE'M IDE
LBL_product_version=Floyd CURSE'M IDE ${app.title} ${netbeans.application.version}
current.version=Floyd CURSE'M IDE

# Application title
app.title=Floyd CURSE'M IDE
app.title.short=Floyd IDE
brand.company=Legacy AI
Step 3.2: Update UI Bundle PropertiesFile: nb/branding/modules/core/core.jar/org/netbeans/core/ui/Bundle.propertiesPropertiesCTL_Main_Window_Title=Floyd CURSE'M IDE
CTL_Main_Window_Title_Project=Floyd CURSE'M IDE - {0}
LBL_No_Open_Projects=No Projects Open - Floyd CURSE'M IDE
Step 3.3 & 3.4: Replace ImagesCopy your created .png assets (Splash, Icons) into the respective directories detailed in the Architecture section.Phase 4: IDE Branding Changes (Days 13-15)Step 4.1: Update IDE Bundle PropertiesFile: nb/ide/branding/modules/ide/ide.jar/org/netbeans/ide/Bundle.propertiesProperties# About box title
LBL_AboutBoxTitle=About Floyd CURSE'M IDE

# About box text
LBL_AboutBoxText=\
Floyd CURSE'M IDE\n\
\n\
Version: ${netbeans.application.version}\n\
\n\
The Ultimate Terminal-Centric Environment.\n\
A Legacy AI Product.\n\
\n\
Copyright © 2026 Legacy AI. All rights reserved.\n\
\n\
Floyd CURSE'M IDE is derived from Apache NetBeans.\n\
Apache NetBeans is a trademark of The Apache Software Foundation.\n\
\n\
Licensed under the Apache License, Version 2.0
Phase 5: Theme Implementation (Days 16-20)CRITICAL: This Java file controls the actual Swing rendering. It must match the hex codes exactly.Step 5.1: Create Look and Feel ExtensionFile: floyd-branding/themes/FloydTheme.javaJavapackage org.floyd.cursem.theme;

import javax.swing.plaf.ColorUIResource;
import java.awt.Color;

public class FloydTheme extends javax.swing.plaf.metal.MetalTheme {

    @Override
    public String getName() {
        return "Floyd Dark (Legacy AI)";
    }

    // Primary 1: Electric Purple Accent #AB18E4
    protected ColorUIResource getPrimary1() {
        return new ColorUIResource(0xAB18E4);
    }

    // Primary 2: Deep Void Background #0E111A
    protected ColorUIResource getPrimary2() {
        return new ColorUIResource(0x0E111A);
    }

    // Primary 3: Deep Indigo Secondary #1C165E
    protected ColorUIResource getPrimary3() {
        return new ColorUIResource(0x1C165E);
    }

    // Secondary 1: Dark Blue Border #231991
    protected ColorUIResource getSecondary1() {
        return new ColorUIResource(0x231991);
    }

    // Secondary 2: Base Background #0E111A
    protected ColorUIResource getSecondary2() {
        return new ColorUIResource(0x0E111A);
    }

    // Secondary 3: Panel Background #1C165E
    protected ColorUIResource getSecondary3() {
        return new ColorUIResource(0x1C165E);
    }

    @Override
    public ColorUIResource getControlTextColor() {
        return new ColorUIResource(0xffffff); // White text
    }

    // Menu selection background: Bright Blue/Purple #561DFF
    @Override
    public ColorUIResource getMenuSelectedBackground() {
        return new ColorUIResource(0x561DFF);
    }
    
    // Menu selection text: White
    @Override
    public ColorUIResource getMenuSelectedForeground() {
        return new ColorUIResource(0xffffff);
    }
}
Check: Run ant build immediately after creating this file. Fix any Java syntax errors.Step 5.2: Create Syntax Highlighting ThemeFile: floyd-branding/themes/EditorFontsColors.xmlXML<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE font-colors PUBLIC "-//NetBeans//DTD Editor Fonts and Colors settings 1.1//EN" "http://www.netbeans.org/dtds/EditorFontsColors-1_1.dtd">
<font-colors>
    <fontcolor name="keyword" bgColor="0E111A" fgColor="AB18E4" bold="true"/>
    <fontcolor name="string" bgColor="0E111A" fgColor="371DF4"/>
    <fontcolor name="comment" bgColor="0E111A" fgColor="5C5B62" italic="true"/>
    <fontcolor name="number" bgColor="0E111A" fgColor="A015A7"/>
    <fontcolor name="operator" bgColor="0E111A" fgColor="ffffff"/>
    <fontcolor name="identifier" bgColor="0E111A" fgColor="ffffff"/>
    <fontcolor name="background" bgColor="0E111A" fgColor="ffffff"/>
</font-colors>
Phase 6: Installer and Distribution (Days 21-25)Step 6.4: Update macOS BundleFile: floyd-branding/macos/Info.plistXML<key>CFBundleName</key>
<string>Floyd CURSE'M IDE</string>
<key>CFBundleDisplayName</key>
<string>Floyd CURSE'M IDE</string>
<key>CFBundleIdentifier</key>
<string>ai.legacy.floyd.cursem</string>
<key>CFBundleIconFile</key>
<string>floyd-cursem.icns</string>
<key>NSHumanReadableCopyright</key>
<string>Copyright © 2026 Legacy AI. All rights reserved.</string>
Legal & Licensing ConsiderationsLegacy AI AttributionWhile the product name is "Floyd CURSE'M IDE", the legal owner is "Legacy AI".Splash Screen: Must say "A Legacy AI Product".About Box: "Copyright © 2026 Legacy AI".Apache Attribution: You must still include: "This product is based on Apache NetBeans. Apache NetBeans is a trademark of The Apache Software Foundation."Testing & ValidationTesting Checklist (The "Fix as you go" Protocol)Visual Testing[ ] Splash Screen: Confirmed correct logo and colors (#0E111A background).[ ] Icons: All sizes render; no old NetBeans cubes visible.[ ] Theme: Editor background is #0E111A. Sidebars are #1C165E.[ ] Text: Comments are muted gray (#5C5B62), Keywords are Neon Purple (#AB18E4).Build & Code Validation[ ] Java Errors: Zero compilation errors in FloydTheme.java.[ ] TS Errors: If integrating web/CLI components, zero TypeScript errors in the build log.[ ] Launch: IDE launches cleanly without stack traces in the console.Timeline & MilestonesWeekPhaseKey DeliverablesWeek 1SetupBuild verification, Protocol establishment.Week 2AssetsLegacy AI Logos, Splash Screen, Icon generation.Week 3BrandingReplace Branding Jars, Update Bundle Properties.Week 4ThemeImplement #0E111A / #AB18E4 Java Theme.Week 5InstallersUpdate macOS plist to ai.legacy...Week 6PolishFinal "Build & Fix" cycles.Next Steps:Execute Phase 1: Clone the repo and get a green build.Generate Assets: Create the "Legacy AI" branded splash screen using the new palette.Begin Phase 2: Implement the Color Theme CSS.REMINDER: Test the build after every single edit. Fix errors immediately.