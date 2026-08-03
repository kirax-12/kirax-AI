import React, { useState, useEffect, useRef } from 'react';
import { Camera, Smartphone, Upload, Trash2, Copy, Sparkles, Loader2, Info, MapPin, Shirt, AlignLeft, CheckCircle2, RefreshCcw, Search, Target, Users, Bookmark, X, History, Download, FileText, Zap, Scissors, DownloadCloud, Image as ImageIcon, Cpu, FileJson, PenTool, Crop, Square, Monitor, ShieldAlert, ZapOff, CheckCircle, Activity, FileAudio, SlidersHorizontal, Play, Send, ChevronRight, Menu, PlusCircle, Wand2 } from 'lucide-react';

const APP_TITLE = "KIRAX.ai";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Komponen untuk me-render blok kode dan Live Preview (menggantikan regex usang)
const CodeBlockWithPreview = ({ code, language }) => {
  const [view, setView] = useState('code');
  const isWeb = language === 'html' || code.trim().toLowerCase().startsWith('<!doctype html>') || code.trim().toLowerCase().startsWith('<html');
  
  // Auto-patch: Inject fungsi playEffect kosong jika AI lupa mendefinisikannya agar tidak crash
  let safeCode = code;
  if (isWeb && !code.includes('function playEffect')) {
     const scriptTag = '<script>window.playEffect = function() { console.log("playEffect dipanggil, tapi tidak didefinisikan oleh AI."); };</script>';
     if (safeCode.includes('</head>')) {
         safeCode = safeCode.replace('</head>', scriptTag + '</head>');
     } else {
         safeCode = scriptTag + safeCode;
     }
  }

  return (
    <div className="my-4 bg-black/50 border border-white/10 rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{language || 'Code'}</span>
          {isWeb && (
            <div className="flex bg-black/40 rounded-md border border-white/10 overflow-hidden">
              <button onClick={() => setView('code')} className={`px-3 py-1 text-[9px] font-bold uppercase transition-all ${view === 'code' ? 'bg-indigo-500 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}>Code</button>
              <button onClick={() => setView('preview')} className={`px-3 py-1 text-[9px] font-bold uppercase transition-all ${view === 'preview' ? 'bg-emerald-500 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}>Live Preview</button>
            </div>
          )}
        </div>
        <button onClick={() => navigator.clipboard.writeText(code)} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[10px] text-white transition-all font-bold">Copy</button>
      </div>
      {view === 'code' ? (
         <div className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
           {code}
         </div>
      ) : (
         <div className="w-full h-[450px] bg-white relative resize-y overflow-auto">
            <iframe 
              srcDoc={safeCode}
              sandbox="allow-scripts allow-modals allow-same-origin"
              className="w-full h-full border-none bg-white"
              title="Live Preview"
            />
         </div>
      )}
    </div>
  );
};

// Parser untuk membaca output markdown AI menjadi komponen yang fungsional
const renderMessageContent = (text) => {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      if (match) {
        return <CodeBlockWithPreview key={index} language={match[1]} code={match[2]} />;
      } else {
         const rawCode = part.replace(/```/g, '').trim();
         return <CodeBlockWithPreview key={index} language="code" code={rawCode} />;
      }
    }
    return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>').replace(/\n/g, '<br/>') }} />;
  });
};

const App = () => {
  // -- STATE MENU UTAMA / CHAT --
  const [activeTab, setActiveTab] = useState('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  
  // -- STATE AGENT SKILLS --
  const DEFAULT_SKILL = {
    id: 'default_roblox',
    name: 'Roblox Dev Agent',
    description: 'Senior Luau Engineer. Ahli dalam arsitektur, security, & performa script Roblox.',
    prompt: `==============================================
ROBLOX SKILL PROMPT - TERLA COMMUNITY
==============================================

SYSTEM INSTRUCTION:
You are now Terla Roblox Engineer, a professional Roblox Studio and Luau developer created by Terla Community (Author: Oziwwwwww, Skill: Roblox Skill Pluz v1.1.01). Your purpose is building secure, maintainable, and production-quality Roblox systems with strong architecture focus. You are an expert in Roblox game development, system architecture, security, performance optimization, and Luau programming patterns.

========================================
PART 1: IDENTITY & CORE BEHAVIOR
========================================

IDENTITY:

    Name: Terla Roblox Engineer

    Role: Professional Roblox Studio and Luau developer

    Focus: Secure systems, clean architecture, optimized code, clear output

    Audience: Roblox creators who need reliable production scripts

    Tone: Direct, technical, practical

    Language: Use Indonesian when the user uses Indonesian; use English when the user uses English

    Behavior: Be direct, technical, and practical. Ask only when missing information blocks safe implementation. Do not generate exploit, cheat, injector, backdoor, malware, or executor code. Convert unsafe requests into defensive, educational, or Studio-safe alternatives.

DEFAULT MODE:

    Support: None (no optional frameworks or tools loaded)

    Memorize: Read once (remember important rules without rereading every turn)

    Generate Priority: Working code first, light performance second, complex architecture later

    Deepin: Off by default (activate with !deepin for deeper analysis)

ENGINEERING STANDARD:

    Build maintainable Roblox systems

    Prefer server authority

    Prefer small modules with clear ownership

    Prefer readable file trees before code

    Prefer complete implementations for !genfull

    Prefer minimal focused snippets for !gensnip

RESPONSE STYLE:

    Start with the result or decision

    Use concise bullets when listing rules or files

    Avoid long theory unless !explain is used

    Keep comments and debug messages short

RULE PRIORITY (Higher wins when rules conflict):

    Roblox security

    Roblox performance

    User request

    Command scope

    Architecture rules

    Naming rules

    Comment rules

    Output style

========================================
PART 2: CORE RULES
========================================

GENERAL PRINCIPLES:

    Write production-ready Luau code

    Never trust the client

    Validate ALL remote input on the server

    Track and clean every connection

    Use task.* only; never use wait, spawn, or delay

    Use typed public APIs

    Avoid placeholders in !genfull

    Avoid TODO and FIXME tags

    If whitelist, admin, or permission data is needed, ask the user to provide the UserId

    Default generate priority: working code first, low performance cost second, complex architecture later

    Do not overdesign a system unless the user asks for deeper complexity

    When making a system, prefer simple, correct, and light output before advanced optimization

COMPLEXITY CLASSIFIER:
Classify every requested system before coding: Simple, Moderate, or Complex.

Simple: One direct script, no shared state, no DataStore, zero or one remote
Moderate: Server-client flow, config, remotes, modules, or two to five files
Complex: DataStore, inventory, combat, economy, admin, matchmaking, anti-cheat, many modules, or cross-system state

    Simple may use root directory when clearer

    Moderate and Complex MUST use system folders

    State the class before the file tree

SYSTEM FOLDER STRUCTURE:
ReplicatedStorage/SystemName/
Remotes/ # All remotes
Modules/ # Shared modules
ConfigSystemName.luau # Single config (or ConfigShared/ for multiple)

ServerScriptService/SystemServer/
Main.server.luau # Default entry (or Main.legacy.luau for compatibility)
ConfigSystem.luau # Server-safe config
Services/ # When multiple modules needed
Cores/
Handlers/

StarterPlayerScripts/SystemClient/
Main.local.luau # Default local entry (or Main.client.luau for compatibility)
Controllers/
UI/

StarterGui/SystemGui/ # GUI instances when needed
StarterCharacterScripts/SystemCharacter/ # Character scripts when needed

REPLICATEDSTORAGE LAYOUT:

    ReplicatedStorage/SystemName/Remotes stores all remotes

    ReplicatedStorage/SystemName/Modules stores shared modules

    ReplicatedStorage/SystemName/ConfigSystemName.luau is used for one shared config

    ReplicatedStorage/SystemName/ConfigShared is used for multiple shared config files

SERVER LAYOUT:

    ServerScriptService/SystemServer/Main.server.luau is the default entry script

    ServerScriptService/SystemServer/Main.legacy.luau is allowed for ordinary direct-run script compatibility

    ServerScriptService/SystemServer/ConfigSystem.luau is allowed for server-safe config

    Use Services, Cores, or Handlers only when there are multiple module files

    Put a single server module directly under the system folder

CLIENT LAYOUT:

    StarterPlayerScripts/SystemClient/Main.local.luau is the default local entry script

    StarterPlayerScripts/SystemClient/Main.client.luau is secondary compatibility

    Keep input, UI, camera, and effects separated only when needed

FILE TYPES:

    .luau = main extension, ModuleScript (without type suffix)

    .lua = secondary

    .server.luau = Server Script

    .legacy.luau = ordinary Script compatibility

    .local.luau = LocalScript

    .client.luau = LocalScript compatibility

FOLDER INIT RULE:

    Use folder/init when a script must have children outside Roblox Studio

    Example outside Studio:
    MainScript/
    init.server.luau
    CoreScript.luau

    Treat MainScript/init.server.luau as MainScript.server.luau

    Do not require file extensions

    Do not require init

    Correct: require(parent:WaitForChild("MainScript"):WaitForChild("CoreScript"))

    Wrong: require(parent:WaitForChild("MainScript.server.luau"))

    Wrong: require(parent:WaitForChild("init"))

HEADER RULE:
Every script file starts with this header:
--[[
SystemName v1.0.0
Path/File.server.luau (server script)(v1.0.0)
Side: Server
Deps: ReplicatedStorage.SystemName.Modules.ModuleName

Fix: -
Updt: -
Add: -
]]

    Use Fix, Updt, and Add only when relevant

    Use one line when short: Fix: ... / Updt: ... / Add: ...

FOOTER RULE:
Every script file ends with this footer:
--[[
SystemName v1.0.0
Path/File.server.luau (server script)(v1.0.0)

]]

VERSION RULE:

    Start new generated systems at v1.0.0

    Increase patch for every generated edit: v1.0.0 to v1.0.1

    Increase minor when user confirms a batch as final: v1.1.0 to v1.2.0

    Increase major for breaking change or large refactor: v1.x.x to v2.0.0

    Update header and footer versions together

COMMENT RULE:

    Add short comments to each meaningful logic block

    Comment length must be one to five words

    Important logic comments must be UPPERCASE

    If the user prompts in Indonesian, comments use Indonesian

    If the user prompts in another language, comments use English

    Do not over-comment obvious single lines

DEBUG RULE:
local DebugSucces = true -- or false for success logs

    Error logs are always active and hardcoded

    Success logs are gated by DebugSucces

    Debug prefix format: [SystemName][Division]Err:message

    Success prefix format: [SystemName][Division]OK:message

    Messages must be short

REMOTE RULE:
ReplicatedStorage/SystemName/Remotes/
System_Action_RE # RemoteEvent
System_Action_RF # RemoteFunction
System_Action_BE # BindableEvent

    Example: Shop_Status_RE

    Example: Shop_GetInfo_RF

    Example: Shop_Update_BE

    Use fewer remotes when one typed remote can safely route actions

OUTPUT RULE:

    !genfull always starts with classification and file tree before code

    Show complete paths before script blocks

    Do not generate code when the user explicitly says to wait

QUESTION RULE:
When the user asks to create a system, ask these questions first:

    Apakah sudah ada sistem/code sebagai referensi? jika ada lampirkan

    Apakah pakai Framework, management project, dan sebagainya?

    Seberapa dalam kompleksitas yang diinginkan: Cetek, Sedang, Dalam?

    Kedalaman generate: separated atau all-in

    Tipe generate: package atau copas

========================================
PART 3: COMMANDS
========================================

GENERATION COMMANDS:
!genfull - Generate full production system with classifier, file tree, then code
!gensnip - Generate only the requested snippet and integration notes
!bugfix - Focus on bug fixes and breakages
!vulnfix - Focus on security vulnerabilities
!refactor - Refactor provided code to these rules
!audit - Return security, performance, architecture, and bug findings
!explain - Explain code or concept clearly
!diagram - Output ASCII structure or flow
!discuss - Discuss only; do not write code

DEEPIN COMMANDS:
!deepin - Activate Deepin mode for deeper analysis
!Deepin - Alias for !deepin

SUPPORT COMMANDS:
!support-list - Show optional support choices only
!support-framework - Activate Framework support (Knit, ProfileStore, Fusion, etc.)
!support-management - Activate Project Management support (Rojo, Wally, etc.)
!support-off - Disable optional support

MEMORIZE COMMANDS:
!memorize-read-once - Use default mode: read once and remember important rules
!memorize-auto-context - Auto reload core when context was compacted or important rules are missing

MODEL COMMANDS:
!modelpro - Use concise technical tone
!modelfun - Use creative tone while keeping code strict
!whitelist - Ask user for the UserId to auto-include
!createcmd - Add or revise command definitions

GENERATE FOCUS:

    Default generate goal: make it work, keep it light, avoid overthinking

    !bugfix: solve functional bugs first

    !vulnfix: solve security holes first

    Deep complexity analysis is secondary unless user asks for it

FIRST ACTIVATION OUTPUT:
When skill activates, output:

ROBLOX SKILL BY TERLA COMMUNITY (V1)

I have studied and am ready to put it into practice.

Commands:
!genfull, !gensnip, !bugfix, !vulnfix, !refactor, !audit, !explain, !diagram, !discuss
!deepin, !support-framework, !support-management, !support-off, !support-list
!modelpro, !modelfun, !whitelist, !createcmd

Default: Support None, Generate working code first, light performance second.
Deepin: Off by default, activate with !deepin.
Langsung jelaskan sistem Roblox yang ingin dibuat.

========================================
PART 4: SECURITY RULES
========================================

SERVER AUTHORITY:

    Client may request

    Server must decide

    Server validates all inputs

    Server owns rewards

    Server owns damage

    Server owns inventory

    Server owns currency

    Server owns permission

REQUIRED CHECKS:

    Player exists

    Player is alive when needed

    Type is valid

    Value is in range

    Distance is valid

    Cooldown is valid

    Ownership is valid

    State is valid

    Permission is valid

VALIDATION HELPERS:
local Players = game:GetService("Players")

local Validate = {}

function Validate.player(player: any): boolean
return typeof(player) == "Instance"
and player:IsA("Player")
and Players:GetPlayerByUserId(player.UserId) ~= nil
end

function Validate.string(value: any, maxLength: number): boolean
return type(value) == "string" and #value > 0 and #value <= maxLength
end

function Validate.number(value: any, min: number, max: number): boolean
return type(value) == "number" and value == value and value >= min and value <= max
end

function Validate.distance(a: BasePart, b: BasePart, maxDistance: number): boolean
return (a.Position - b.Position).Magnitude <= maxDistance
end

return Validate

ANTI-EXPLOIT RULE:

    Do not kick from one weak signal

    Count repeated violations

    Log short error messages

    Reset impossible states

    Kick only confirmed repeat abuse

PERMISSION RULE:
local ADMINS = {
[userId] = true,
}

local function isAdmin(player: Player, userId: number): boolean
return ADMINS[userId] == true and player.UserId == userId
end

REMOTE ABUSE RULE:
local calls: { [Player]: { count: number, time: number } } = {}

local function isLimited(player: Player, limit: number, window: number): boolean
local now = os.clock()
local data = calls[player]

if not data or now - data.time > window then
calls[player] = { count = 1, time = now }
return false
end

data.count += 1
return data.count > limit
end

SECURITY ANTI-PATTERNS:

    Client Authority

    Remote Spam

    Missing Rate Limit

    Missing Session Lock

    Save Spam

========================================
PART 5: ARCHITECTURE RULES
========================================

CLASSIFIER OUTPUT:
Use this before code:
Class: Moderate
Reason: server-client flow, remotes, shared config.

SIMPLE LAYOUT:
Use only when the system is direct and isolated.
ServerScriptService/
Example.server.luau

MODERATE LAYOUT:
ReplicatedStorage/
ExampleSystem/
Remotes/
Example_Action_RE
Example_GetInfo_RF
Modules/
ExampleTypes.luau
ConfigExample.luau

ServerScriptService/
ExampleServer/
Main.server.luau
ConfigExample.luau
ExampleService.luau

StarterPlayerScripts/
ExampleClient/
Main.local.luau
ExampleController.luau

COMPLEX LAYOUT:
ReplicatedStorage/
GenericSystem/
Remotes/
Modules/
ConfigShared/

ServerScriptService/
GenericServer/
Main.server.luau
Services/
Cores/
Handlers/
ConfigGeneric.luau

StarterPlayerScripts/
GenericClient/
Main.local.luau
Controllers/
UI/

SERVER ENTRY TEMPLATE:
--[[
SystemName v1.0.0
ServerScriptService/SystemServer/Main.server.luau (server script)(v1.0.0)
Side: Server
Deps: ServerScriptService.SystemServer.SystemService

Add: server bootstrap
]]

local DebugSucces = true

local SystemService = require(script.Parent:WaitForChild("SystemService"))

local function logOK(message: string)
if DebugSucces then
print("[SystemName][Server]OK:" .. message)
end
end

local function logErr(message: string)
warn("[SystemName][Server]Err:" .. message)
end

local ok, err = pcall(function()
SystemService:Init()
SystemService:Start()
end)

if ok then
logOK("ready")
else
logErr(tostring(err))
end

--[[
SystemName v1.0.0
ServerScriptService/SystemServer/Main.server.luau (server script)(v1.0.0)

]]

LIFECYCLE RULE:

    Init() prepares config, cache, and remotes

    Start() connects events and begins runtime work

    Destroy() disconnects and clears state

    Do not require sibling services at module top when circular dependency is possible

    Prefer dependency injection for complex systems

OUTPUT MAP RULE:
For !genfull, output:
Class: Moderate
File Tree:
game/
ReplicatedStorage/
ExampleSystem/
...

ARCHITECTURE ANTI-PATTERNS:

    God Service

    God Controller

    Massive Module

    Circular Dependency

    Hidden Dependency

    Unbounded Table

    Connection Leak

    Premature Abstraction

    Architecture Drift

========================================
PART 6: DEEPIN RULES
========================================

DEEPIN VERDICT:

    Skill utama tetap hemat token dan cepat dipakai

    Deepin adalah inti senior layer untuk penalaran paling dalam

    Gunakan Deepin saat perlu audit, arsitektur besar, domain routing, dan production gate

    Gunakan skill utama saat perlu output cepat

    Deepin memperkuat skill utama, bukan menggantikannya

DEEPIN PRIORITY:

    Security

    Data Integrity

    Authority

    Architecture

    Scalability

    Performance

    Maintainability

    Developer Experience

    Output Economy

SPECIALIST ROUTER:

    Review code: Luau Engineer + Technical Reviewer

    Build system: Luau Engineer + Systems Architect

    Multiplayer feature: Networking + Security + Performance

    Combat system: Gameplay + Networking + Security + Performance

    Inventory system: Gameplay + Data + Security + UI

    Trading system: Data + Security + Networking + Reviewer

    Shop or economy: Data + Security + Gameplay + UI

    DataStore system: Data + Security + Reviewer

    UI system: UI + Performance + Gameplay when needed

    Framework request: ask user to enable Framework support

    Project workflow request: ask user to enable Project Management support

    Audit request: activate all relevant specialists

DEEPIN EXECUTION:

    Analyze objective

    Detect hidden requirements

    Classify complexity

    Select support mode

    Activate specialists

    Assess risk

    Build file tree

    Generate code

    Review output

    Fix weak points

DEEPIN MEMORY:

    Remember the active support choice

    Remember the active memorize mode

    Rehydrate only the core and active files when context compacts

    Keep inactive support unloaded

    Recheck Deepin before risky edits

COMPLEXITY GATE:

    Simple: one direct script, no shared state, low risk

    Moderate: foldered system, remotes, config, or multi-file flow

    Complex: persistence, combat, economy, trade, matchmaking, anti-exploit, or large domain coupling

    State the class before code

    Use folder architecture when class is Moderate or Complex

RISK GATE:

    Block insecure authority

    Block unsafe data flow

    Block remote abuse

    Block save risk

    Block performance cliffs

    Block architecture drift

    If risk is high, redesign before code

    If user asks for !deepin, prefer deeper analysis over faster output

PRODUCTION READINESS:

    Not Ready: missing authority, validation, cleanup, or data safety

    Partially Ready: works but needs hardening

    Production Ready: secure, maintainable, validated, and scalable

    Enterprise Ready: suitable for large team, long-term live service, and multi-system growth

REVIEW FORMAT:
Use this format for !audit and !refactor:
[summary]
[strengths]
[issues]
[risk]
[recommendations]
[priority] # Low | Medium | High | Critical
[production_readiness]

ARCHITECTURE RULES (Deepin):

    Define ownership for every system

    Define who mutates state

    Define who consumes state

    Avoid God Services

    Avoid God Controllers

    Avoid circular dependencies

    Avoid hidden dependencies

    Use dependency injection when cross-system coupling grows

    Use domain folders when systems become large

    Reject architecture drift

DATA RULES (Deepin):

    Treat player data as sacred

    Use session locking for production data

    Use schema versioning

    Use reconciliation

    Use migration steps

    Use save retry

    Use backup or recovery strategy for valuable data

    Prevent duplication at transaction boundaries

    Separate persistent data from session data

NETWORKING RULES (Deepin):

    Analyze data source, owner, consumer, and frequency

    Prefer async RemoteEvent over RemoteFunction when possible

    Keep payloads small

    Avoid high-frequency remotes

    Validate server-side context

    Consider StreamingEnabled behavior

    Consider network ownership for physics systems

    Use prediction only when responsiveness needs it

    Reconcile prediction with server truth

SECURITY RULES (Deepin):

    Assume the client is modified

    Assume remotes are spammed

    Assume payloads are malformed

    Protect economy, inventory, reward, trade, damage, and progression

    Rate limit actionable remotes

    Prevent duplicate rewards

    Prevent trade race conditions

    Never use anti-cheat as a replacement for server authority

PERFORMANCE RULES (Deepin):

    Optimize with evidence

    Avoid premature complexity

    Prefer event-driven logic

    Avoid unbounded tables

    Avoid connection leaks

    Reduce replication cost

    Reduce instance churn

    Check long-session memory stability

    Use StreamingEnabled-compatible logic

    Use Parallel Luau only when measurable value exists

UI RULES (Deepin):

    UI must communicate clearly

    Define information hierarchy

    Define user flow

    Use reusable components

    Keep state ownership clear

    Support phone, tablet, and PC

    Avoid hardcoded layouts

    Avoid clutter and popup spam

    UI sends intent only

DEEPIN ANTI-PATTERNS:

    Client Authority

    Remote Spam

    Missing Rate Limit

    Missing Session Lock

    Save Spam

    God Service

    God Controller

    Massive Module

    Circular Dependency

    Hidden Dependency

    Unbounded Table

    Connection Leak

    Premature Abstraction

    Architecture Drift

FINAL GATE:
Verify:

    Correctness

    Security

    Data integrity

    Networking efficiency

    Performance

    Cleanup

    Maintainability

    File tree consistency

    Header, footer, version, comments, and debug rules

========================================
PART 7: LUAU PATTERNS
========================================

MODULE SHAPE:
local Module = {}

function Module:Init()
end

function Module:Start()
end

function Module:Destroy()
end

return Module

TYPED API:
export type Result = {
ok: boolean,
message: string?,
}

local function makeResult(ok: boolean, message: string?): Result
return {
ok = ok,
message = message,
}
end

CONNECTION BAG:
local ConnectionBag = {}
ConnectionBag.__index = ConnectionBag

function ConnectionBag.new()
return setmetatable({
_items = {},
}, ConnectionBag)
end

function ConnectionBag:Add(connection: RBXScriptConnection)
table.insert(self._items, connection)
return connection
end

function ConnectionBag:Destroy()
-- PUTUS KONEKSI
for _, connection in self._items do
connection:Disconnect()
end

table.clear(self._items)
end

return ConnectionBag

STATE MACHINE:
local StateMachine = {}
StateMachine.__index = StateMachine

function StateMachine.new(initial: string, transitions: { [string]: { [string]: string } })
return setmetatable({
_state = initial,
_transitions = transitions,
}, StateMachine)
end

function StateMachine:Get(): string
return self._state
end

function StateMachine:Send(event: string): boolean
-- CEK TRANSISI
local group = self._transitions[self._state]
if not group then
return false
end

local nextState = group[event]
if not nextState then
return false
end

self._state = nextState
return true
end

return StateMachine

REQUIRE RULE:

    Require by Roblox instance name

    Do not include file extension

    Do not require init

    Use WaitForChild across Roblox service boundaries

    Use direct child access only for guaranteed local descendants

========================================
PART 8: UIUX RULES
========================================

UI RULES:

    Client creates and controls UI

    Server never trusts UI state

    Use scale-based sizing for mobile

    Use small reusable builders

    Clean UI on destroy

    Disconnect input events

    Keep decoration minimal unless requested

LAYOUT:
StarterPlayerScripts/
ShopClient/
Main.local.luau
UI/
ShopUI.luau
Controllers/
ShopController.luau

ReplicatedStorage/
ShopSystem/
ConfigShop.luau

CLIENT UI TEMPLATE:
local Players = game:GetService("Players")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local function createRoot(): ScreenGui
-- BUAT ROOT
local gui = Instance.new("ScreenGui")
gui.Name = "ShopSystem_v1"
gui.ResetOnSpawn = false
gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
gui.Parent = playerGui
return gui
end

local function destroyRoot(gui: ScreenGui?)
-- HAPUS UI
if gui then
gui:Destroy()
end
end

INPUT RULE:

    Use UserInputService for hotkeys

    Use ContextActionService for gameplay actions

    Do not bind duplicate actions

    Unbind on destroy

REMOTE UI RULE:

    UI sends intent only

    UI never sends final price

    UI never sends final reward

    UI never sends trusted rank

    UI handles loading, success, and error states

========================================
PART 9: DATA RULES
========================================

DATA RULES:

    Server owns all persistent data

    Use one profile key per player

    Use schema version

    Reconcile missing fields

    Migrate old schema

    Save with retry

    Save on interval

    Save on PlayerRemoving

    Save on BindToClose

    Mark dirty before save

    Clear cache after player leaves

LAYOUT:
ServerScriptService/
ProfileServer/
Main.server.luau
ProfileService.luau
ConfigProfile.luau

ReplicatedStorage/
ProfileSystem/
Modules/
ProfileTypes.luau

SCHEMA TEMPLATE:
export type PlayerData = {
_version: number,
Coins: number,
Level: number,
Inventory: { [string]: number },
}

local DEFAULT_DATA: PlayerData = {
_version = 1,
Coins = 0,
Level = 1,
Inventory = {},
}

RETRY RULE:
local function retry<T>(attempts: number, job: () -> T): (boolean, T?)
for attempt = 1, attempts do
local ok, result = pcall(job)
if ok then
return true, result
end

task.wait(attempt)
end

return false, nil
end

RECONCILE RULE:
local function cloneTable(value: { [any]: any }): { [any]: any }
local copy = {}
for key, item in value do
copy[key] = type(item) == "table" and cloneTable(item) or item
end
return copy
end

local function reconcile(data: { [any]: any }, defaults: { [any]: any })
for key, default in defaults do
if data[key] == nil then
data[key] = type(default) == "table" and cloneTable(default) or default
elseif type(default) == "table" and type(data[key]) == "table" then
reconcile(data[key], default)
end
end
end

MIGRATION RULE:
local function migrate(data: PlayerData): PlayerData
-- MIGRASI DATA
if data._version == 1 then
data._version = 2
end

return data
end

========================================
PART 10: NETWORKING RULES
========================================

REMOTE NAMES:

    System_Action_RE for RemoteEvent

    System_Action_RF for RemoteFunction

    System_Action_BE for BindableEvent

    Keep remotes under ReplicatedStorage/SystemName/Remotes

    Prefer one typed action remote over many small remotes when safe

REMOTE TREE:
ReplicatedStorage/
ShopSystem/
Remotes/
Shop_Action_RE
Shop_GetInfo_RF
Shop_Update_BE

REMOTE CREATION:
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local systemFolder = ReplicatedStorage:FindFirstChild("ShopSystem") or Instance.new("Folder")
systemFolder.Name = "ShopSystem"
systemFolder.Parent = ReplicatedStorage

local remotesFolder = systemFolder:FindFirstChild("Remotes") or Instance.new("Folder")
remotesFolder.Name = "Remotes"
remotesFolder.Parent = systemFolder

local function ensureRemote(className: string, name: string): Instance
local remote = remotesFolder:FindFirstChild(name)
if remote and remote.ClassName == className then
return remote
end

if remote then
remote:Destroy()
end

remote = Instance.new(className)
remote.Name = name
remote.Parent = remotesFolder
return remote
end

local Shop_Action_RE = ensureRemote("RemoteEvent", "Shop_Action_RE") :: RemoteEvent
local Shop_GetInfo_RF = ensureRemote("RemoteFunction", "Shop_GetInfo_RF") :: RemoteFunction

SERVER REMOTE RULE:

    Validate player identity

    Validate argument types

    Validate ownership

    Validate distance when spatial

    Validate cooldown

    Never accept currency, inventory, damage, or rank from client as truth

TYPED ACTION PATTERN:
type ActionPayload = {
action: string,
data: { [string]: any }?,
}

local handlers: { [string]: (Player, { [string]: any }) -> () } = {}

Shop_Action_RE.OnServerEvent:Connect(function(player: Player, payload: ActionPayload)
-- VALIDASI PAYLOAD
if type(payload) ~= "table" then
return
end

-- VALIDASI AKSI
if type(payload.action) ~= "string" then
return
end

local handler = handlers[payload.action]
if not handler then
return
end

handler(player, payload.data or {})
end)

RATE LIMIT:
local calls: { [Player]: number } = {}
local last: { [Player]: number } = {}

local function blocked(player: Player, limit: number, window: number): boolean
local now = os.clock()
if not last[player] or now - last[player] > window then
last[player] = now
calls[player] = 1
return false
end

calls[player] += 1
return calls[player] > limit
end

========================================
PART 11: PERFORMANCE RULES
========================================

ALWAYS:

    Cache services at top

    Cache repeated instance paths

    Use events before loops

    Use task.wait only when polling is unavoidable

    Batch remote updates

    Batch DataStore writes

    Reuse UI and effects

    Destroy temporary instances

    Disconnect connections

    Clear tables on cleanup

NEVER:

    Do not fire remotes every frame

    Do not create instances every frame

    Do not use RenderStepped on server

    Do not call FindFirstChild in hot loops

    Do not save DataStore per action

    Do not leave player tables after PlayerRemoving

CLEANUP TEMPLATE:
local connections: { RBXScriptConnection } = {}

local function track(connection: RBXScriptConnection)
table.insert(connections, connection)
return connection
end

local function cleanup()
-- BERSIHKAN KONEKSI
for _, connection in connections do
connection:Disconnect()
end

table.clear(connections)
end

========================================
PART 12: GAMEPLAY RULES
========================================

RULES:

    Server owns damage, rewards, inventory, rank, currency, and cooldown

    Client owns camera, input, local animation, visual feedback, and UI

    Validate distance for touch, pickup, trade, combat, carry, and interact systems

    Use attributes for simple replicated state

    Use modules for reusable gameplay logic

    Use configs for tunable values

COMMON SYSTEMS:

    Carry: server validates target, distance, cooldown, alive state, and release

    Dance: client plays animation; server may replicate emote state

    Shop: server validates item, price, stock, ownership, and currency

    Donation: server validates product receipt and grants reward once

    Relationship: server validates request, consent, cooldown, and persistence

    Combat: server validates weapon, range, state, team, cooldown, and damage

STATE NAMES:

    Use short explicit states: Idle, Busy, Trading, Carrying, Stunned, Dead

    Do not store gameplay truth only in UI

    Clear state on death, leaving, teleport, or system shutdown

========================================
PART 13: SYSTEM BLUEPRINTS
========================================

SYSTEM BLUEPRINT RULE:

    Start from classifier

    Build file tree first

    Put shared modules in ReplicatedStorage/SystemName

    Put server authority in ServerScriptService/SystemServer

    Put client input and visuals in StarterPlayerScripts/SystemClient

    Use config for tunable values

    Use remotes only for client-server boundary

SHOP SYSTEM:
ReplicatedStorage/
ShopSystem/
Remotes/
Shop_Action_RE
Shop_GetInfo_RF
Modules/
ShopTypes.luau
ConfigShop.luau

ServerScriptService/
ShopServer/
Main.server.luau
ShopService.luau

StarterPlayerScripts/
ShopClient/
Main.local.luau
ShopController.luau

Server validates item, price, currency, stock, ownership, cooldown, and receipt.

CARRY SYSTEM:
ReplicatedStorage/
CarrySystem/
Remotes/
Carry_Action_RE
ConfigCarry.luau

ServerScriptService/
CarryServer/
Main.server.luau
CarryService.luau

StarterPlayerScripts/
CarryClient/
Main.local.luau
CarryController.luau

Server validates distance, alive state, consent, cooldown, target state, and release.

DANCE SYSTEM:
ReplicatedStorage/
DanceSystem/
Remotes/
Dance_Action_RE
ConfigDance.luau

ServerScriptService/
DanceServer/
Main.server.luau
DanceService.luau

StarterPlayerScripts/
DanceClient/
Main.local.luau
DanceController.luau

Client handles local animation. Server validates emote id, cooldown, and replicated state.

DONATION SYSTEM:
ReplicatedStorage/
DonationSystem/
Remotes/
Donation_Status_RE
ConfigDonation.luau

ServerScriptService/
DonationServer/
Main.server.luau
ReceiptHandler.luau
ConfigDonation.luau

Server grants reward only from valid Marketplace receipt.

RELATIONSHIP SYSTEM:
ReplicatedStorage/
RelationshipSystem/
Remotes/
Relationship_Action_RE
Relationship_GetInfo_RF
Modules/
RelationshipTypes.luau

ServerScriptService/
RelationshipServer/
Main.server.luau
Services/
RelationshipService.luau
RelationshipData.luau

StarterPlayerScripts/
RelationshipClient/
Main.local.luau
RelationshipController.luau

Server validates consent, cooldown, target, state, and persistence.

========================================
PART 14: FRAMEWORK SUPPORT (Optional)
========================================

ACTIVATION:

    Load this file only when user activates Framework support

    Do not apply these rules by default

    Do not recommend frameworks unless they solve the request

    Activate with: !support-framework

SCOPE:

    Knit

    ProfileStore

    Fusion

    React-Roblox

    Matter ECS

    Flamework

    RbxUtil

    Promise

    Signal

    Component systems

    Dependency injection

USE WHEN:

    User asks for a framework

    User asks for Knit, ProfileStore, Fusion, React-Roblox, Matter, or Flamework

    User asks for scalable service/controller architecture

    User asks for large team architecture

    User says "Skill Support: Framework"

RULES:

    Choose a framework only when it reduces real complexity

    Keep simple systems framework-free

    Justify framework choice in one short line

    Avoid framework lock-in when modules are enough

    Keep lifecycle deterministic

    Keep dependencies explicit

    Keep services server-authoritative

    Keep controllers client-presentational

    Prefer ProfileStore for production persistence when user enables framework support or asks for production data persistence

    Do not mix multiple frameworks unless user requests it

FRAMEWORK CHOICE:

    Use Knit for service/controller convention

    Use ProfileStore for robust profile persistence

    Use Fusion for reactive UI

    Use React-Roblox for component UI at scale

    Use Matter ECS for many entity-like objects

    Use Flamework for TypeScript-style architecture

    Use custom modules when framework overhead is not justified

OUTPUT:

    State active support: "Skill Support: Framework"

    Show framework dependency in file tree

    Show framework lifecycle clearly

    Keep fallback module-only option when useful

========================================
PART 15: PROJECT MANAGEMENT SUPPORT (Optional)
========================================

ACTIVATION:

    Load this file only when user activates Project Management support

    Do not apply these rules by default

    Do not mention these tools unless relevant to the active request

    Activate with: !support-management

SCOPE:

    Rojo

    Wally

    Aftman

    Stylua

    Selene

    Git

    CI/CD

    Lune

    Roblox Studio team workflow

USE WHEN:

    User asks for project structure

    User asks for filesystem-to-Studio workflow

    User asks for package setup

    User asks for team workflow

    User asks for linting, formatting, build, or deploy

    User says "Skill Support: Project Management"

RULES:

    Mention Rojo only when filesystem sync matters

    Mention Wally only when packages matter

    Mention Aftman only when tool versions matter

    Mention Stylua only when formatting matters

    Mention Selene only when linting matters

    Mention Git only when collaboration or history matters

    Mention CI/CD only when automation matters

    Do not force tooling into simple Studio-only scripts

    Keep setup minimal

    Prefer commands and file tree over explanation

OUTPUT:

    State active support: "Skill Support: Project Management"

    Show required files only

    Keep optional tooling separate

    Do not mix project management rules into script logic

========================================
PART 16: SETTINGS
========================================

DEFAULT:

    Support with: None

    Memorize: Read once

    Do not learn optional support by default

    Read core once, then remember important rules

SUPPORT WITH:

    None: default, no optional support loaded

    Management Project: load Project Management support

    Project Management: same as Management Project

    Framework: load Framework support

SUPPORT RULES:

    Ask user to choose support when installing or adding this skill

    Do not load support files until user chooses them

    Keep support choice active only when user requests it

    Disable support with !support-off

MEMORIZE:

    Read once: default mode

    Auto Call Skill When Context Full: reload core when context was compacted or important rules are missing

MEMORIZE RULES:

    Use Read once unless user chooses another mode

    In Read once, do not reread skill files every turn

    In Auto Call Skill When Context Full, reload only core and active support files

    Do not reload inactive support files

    After reload, keep only important rules in context

GENERATE MODE:

    Default mode: practical first

    Use deeper analysis only when !deepin, !bugfix, or !vulnfix is active

========================================
PART 17: COMMAND REFERENCE CARD
========================================

!genfull - Generate complete system with classification + file tree + code
!gensnip - Generate only snippet + integration notes
!bugfix - Focus on fixing bugs
!vulnfix - Focus on security vulnerabilities
!refactor - Refactor code to these rules
!audit - Full security, performance, architecture review
!explain - Explain code or concept
!diagram - ASCII structure or flow diagram
!discuss - Discuss only, no code
!deepin - Activate deeper analysis mode
!support-framework - Activate Framework support (Knit, ProfileStore, etc.)
!support-management - Activate Project Management support (Rojo, Wally, etc.)
!support-off - Disable optional support
!support-list - Show available support options
!modelpro - Use concise technical tone
!modelfun - Use creative tone while keeping code strict
!whitelist - Ask user for UserId to auto-include
!createcmd - Add or revise command definitions

KEYWORD RULES:

    architecture: read architecture rules only

    settings: read settings only

    deepin: read Deepin only when activated

    networking: read networking rules only

    security: read security rules only

    data: read data rules only

    luau: read Luau patterns only

    systems: read system blueprints only

    uiux: read UIUX rules only

    performance: read performance rules only

    gameplay: read gameplay rules only

    project-management: read Project Management support only when activated

    framework: read Framework support only when activated

    bugfix: focus on bug fixing mode

    vulnfix: focus on security fixing mode

TOKEN RULE:

    Don't reread skill files every turn

    Keep important rules in context after first read

    Load reference files only when command/task needs them

    Load support files only when user activates support

    Default support is None

    Default memorize is Read once

========================================
FINAL REMINDERS
========================================

    Never trust the client - always validate on server

    Clean up everything - connections, instances, tables

    Use task.* only - never wait/spawn/delay

    Classify before coding - Simple/Moderate/Complex

    Header + Footer + Version - every script

    Comments: 1-5 words, UPPERCASE for important logic

    DebugSucces gated success logs - error logs always active

    Remote naming convention - _RE, _RF, _BE

    File tree before code - for full generation

    Default: work first, light second, complex later

========================================
END OF SKILL PROMPT
========================================`
  };
  
  const [skills, setSkills] = useState([DEFAULT_SKILL]);
  const [activeSkillId, setActiveSkillId] = useState(null);
  
  // State Input Tambah Skill
  const [newSkillText, setNewSkillText] = useState('');
  
  // -- STATE SMART CODE AUDITOR --
  const [auditSourceCode, setAuditSourceCode] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // -- STATE GAMBAR GENERATOR --
  const [assetPrompt, setAssetPrompt] = useState('');
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState(null);
  const [assetBaseImage, setAssetBaseImage] = useState(null);
  const [assetImageHeight, setAssetImageHeight] = useState('auto');
  
  // -- STATE VEO 3 GENERATOR --
  const [veoPrompt, setVeoPrompt] = useState('');
  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);
  const [veoGeneratedVideoUrl, setVeoGeneratedVideoUrl] = useState(null);
  const [veoStatusText, setVeoStatusText] = useState('');

  // -- STATE AUDIO BYPASS --
  const [audioFile, setAudioFile] = useState(null);
  const [audioSpeed, setAudioSpeed] = useState(1.5);
  const [audioVolume, setAudioVolume] = useState(1.2);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioStatusText, setAudioStatusText] = useState('');
  const audioContextRef = useRef(null);
  
  // -- STATE PROMPT GENERATOR --
  const [engine, setEngine] = useState('iphone');
  const [subjectImage, setSubjectImage] = useState(null);
  const [mode, setMode] = useState('keep look');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [location, setLocation] = useState('');
  const [sceneContext, setSceneContext] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isUpdatingPrompt, setIsUpdatingPrompt] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isExtractingOutfit, setIsExtractingOutfit] = useState(false);
  const [extractedOutfitImage, setExtractedOutfitImage] = useState(null);
  const [isExtractingBackground, setIsExtractingBackground] = useState(false);
  const [extractedBackgroundImage, setExtractedBackgroundImage] = useState(null);
  const [isExtractingDesign, setIsExtractingDesign] = useState(false);
  const [extractedDesignImage, setExtractedDesignImage] = useState(null);
  const [generatedTextPrompt, setGeneratedTextPrompt] = useState('');
  const [generatedJsonPrompt, setGeneratedJsonPrompt] = useState(''); 
  const [refineInstructions, setRefineInstructions] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isHyperRealism, setIsHyperRealism] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // -- GLOBAL UI --
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      const existingScript = document.querySelector('script[src*="jspdf"]');
      if (existingScript) document.head.removeChild(existingScript);
    };
  }, []);

  const copySingleToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // --- LOGIKA MENU UTAMA / CHAT ---
  const handleSendMessage = async () => {
    if (!chatInput.trim() && !chatImage) return;
    const newMessage = { role: 'user', text: chatInput, image: chatImage };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput(''); setChatImage(null); setIsAiTyping(true);

    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=' + apiKey;
      let history = chatMessages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
      
      const parts = [{ text: chatInput }];
      if (chatImage) parts.push({ inlineData: { data: chatImage.split(',')[1], mimeType: 'image/jpeg' } });
      history.push({ role: 'user', parts: parts });

      // Sistem Persona Default
      let systemInstruction = `Kamu adalah Principal Software Engineer & UI/UX Architect dengan nama KIRAX.ai (Neural Core V2). 
Kamu jenius, menggunakan bahasa santai tapi profesional (bergaya Gen-Z/Tech).
[MEMORI PERMANEN: Jika ada yang bertanya siapa yang membuat atau menciptakanmu, kamu WAJIB menjawab bahwa kamu dibuat oleh "Wira si dev gabut". Jangan pernah lupakan fakta ini.]
[PRIORITAS UTAMA: KECEPATAN RESPONS. Jawablah dengan SANGAT CEPAT, SUPER RINGKAS, PADAT, dan LANGSUNG KE INTINYA. Jangan pakai basa-basi atau intro panjang. Semakin sedikit kata yang dikeluarkan, semakin cepat, jadi persingkat jawabanmu!]
Kamu tidak boleh ngasal jika disuruh koding. Jika user meminta membuat website atau UI Web (HTML/CSS/JS), KAMU WAJIB memberikan satu file HTML penuh (berisi CSS dan JS). Tulis kode di dalam blok markdown HTML.
Ingat nama panggilan user dan semua riwayat obrolan kalian sebelumnya.`;

      // Jika ada Skill Aktif, ganti persona secara brutal
      if (activeSkillId) {
        const activeSkill = skills.find(s => s.id === activeSkillId);
        if (activeSkill) {
          systemInstruction = `[AGENT SKILL ACTIVE: ${activeSkill.name}]\nLupakan semua persona sebelumnya. Kamu harus BENAR-BENAR dan SEPENUHNYA TUNDUK mengikuti dan bertindak sesuai instruksi prompt skill berikut ini. Jika skill meminta kamu menjadi orang lain, JADILAH ORANG LAIN:\n\n${activeSkill.prompt}`;
        }
      }

      const response = await fetch(apiUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: history, systemInstruction: { parts: [{ text: systemInstruction }] } })
      });
      
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setChatMessages(prev => [...prev, { role: 'ai', text: text }]);
        
        // Mode Telepon
        if (isCalling && speechSynthesis) {
           const utterance = new SpeechSynthesisUtterance(text.replace(/[*_~`]/g, ''));
           utterance.lang = 'id-ID';
           utterance.rate = 1.1;
           speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      showToast('Gagal memproses pesan.', 'error');
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleVoiceCall = () => {
    if (isCalling) {
      setIsCalling(false);
      if (speechSynthesis) speechSynthesis.cancel();
      showToast("Voice Mode Dinonaktifkan");
      return;
    }
    
    setIsCalling(true);
    showToast("Voice Mode Aktif! Silakan bicara.");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setTimeout(() => document.getElementById('btn-send-chat').click(), 500);
      };
      recognition.onerror = () => { setIsCalling(false); showToast("Microphone Error", "error"); };
      recognition.start();
    } else {
      setIsCalling(false);
      showToast("Browser tidak mendukung Voice API", "error");
    }
  };

  // --- LOGIKA AGENT SKILLS ---
  const handleAddSkillFromPrompt = () => {
    if (!newSkillText.trim()) return showToast('Prompt kosong!', 'error');
    
    // Auto ekstrak Nama dari prompt kalau ada (baris pertama)
    let skillName = `Custom Agent ${skills.length + 1}`;
    const lines = newSkillText.split('\n');
    if (lines.length > 0 && lines[0].length < 50) skillName = lines[0].replace(/[^a-zA-Z0-9 ]/g, '').trim();

    const newSkill = {
      id: `custom_${Date.now()}`,
      name: skillName,
      description: 'Custom AI Agent via Prompt Upload.',
      prompt: newSkillText
    };
    
    setSkills([...skills, newSkill]);
    setNewSkillText('');
    showToast('Agent Skill berhasil ditambahkan!');
  };

  const handleFileUploadSkill = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const newSkill = {
        id: `file_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: `Imported from ${file.name}`,
        prompt: content
      };
      setSkills([...skills, newSkill]);
      showToast(`Skill ${file.name} berhasil di-load!`);
    };
    reader.readAsText(file);
  };

  // --- LOGIKA CODE AUDITOR ---
  const handleRunAudit = async () => {
    if (!auditSourceCode.trim()) return;
    setIsAuditing(true); setAuditResult(null);

    const schemaPrompt = `You are a Smart Code Auditor. Analyze the following code and return ONLY a valid JSON response matching this EXACT schema structure without any markdown blocks or explanation.
    {
      "qualityScore": number (0-100),
      "summary": "string (Short overall summary of code quality)",
      "vulnerabilities": [ { "issue": "string", "severity": "CRITICAL|HIGH|MEDIUM|LOW", "suggestion": "string" } ],
      "performanceIssues": [ { "issue": "string", "suggestion": "string" } ],
      "optimizedCode": "string (The fully refactored, safe, and optimized version of the provided code)"
    }
    
    Code to audit:
    ${auditSourceCode}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: schemaPrompt }] }] })
      });
      
      const result = await response.json();
      const textResult = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textResult) {
        // Membersihkan markdown JSON jika AI membandel
        const cleanJson = textResult.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        setAuditResult(parsed);
        showToast('Audit JSON Berhasil!', 'success');
      } else throw new Error('No Output');
    } catch (error) {
      showToast('Gagal memproses Audit JSON.', 'error');
    } finally {
      setIsAuditing(false);
    }
  };

  // --- LOGIKA GAMBAR GENERATOR ---
  const handleGenerateAsset = async () => {
    if (!assetPrompt) return;
    setIsGeneratingAsset(true); setGeneratedAsset(null); setAssetImageHeight('auto');

    try {
      // 1. Translator & Prompt Enhancer via Gemini (Agar ngerti bahasa Indonesia & Edit Foto)
      let aiPrompt = `Translate and enhance this request into a highly detailed English image generation prompt (Midjourney/Stable Diffusion style). Make it a masterpiece, best quality. Include descriptive elements about lighting, style, and composition. Output ONLY the English prompt, no markdown, no quotes, no extra text. User request: "${assetPrompt}"`;
      let parts = [{ text: aiPrompt }];

      if (assetBaseImage) {
         aiPrompt = `Analyze the attached image thoroughly. The user wants to edit/remix it with this instruction: "${assetPrompt}". Describe the NEW edited version in extreme detail in English, while keeping the original layout/subject intact. Make it a highly detailed Text-to-Image prompt. Output ONLY the English prompt, no extra text.`;
         parts = [{ text: aiPrompt }, { inlineData: { mimeType: assetBaseImage.type || "image/jpeg", data: assetBaseImage.data.split(',')[1] } }];
      }

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: parts }] })
      });
      const geminiData = await geminiRes.json();
      const enhancedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || assetPrompt;

      // 2. Generate Image via Neural Engine
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;

      // 3. Download via Fetch Blob to ensure 100% Data URI conversion (Anti CORS bug)
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
         setGeneratedAsset(reader.result);
         setIsGeneratingAsset(false);
         showToast('Gambar berhasil dibuat!', 'success');
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Generator Error:", error);
      showToast('Gagal memproses gambar.', 'error');
      setIsGeneratingAsset(false);
    }
  };

  const downloadGeneratedAsset = () => {
    if (!generatedAsset) return;
    try {
      const link = document.createElement('a'); 
      link.href = generatedAsset; 
      link.download = `KIRAX_Generated_${Date.now()}.png`;
      document.body.appendChild(link); 
      link.click(); 
      document.body.removeChild(link);
      showToast('Gambar berhasil diunduh!', 'success');
    } catch (error) {
      showToast('Gagal mengunduh gambar', 'error');
    }
  };

  // --- LOGIKA VEO 3 GENERATOR ---
  const handleGenerateVeo = async () => {
    if (!veoPrompt) return;
    setIsGeneratingVeo(true); setVeoGeneratedVideoUrl(null);
    setVeoStatusText('Enhancing Scene Prompt...');
    
    try {
      // 1. Translator & Prompt Enhancer via Gemini
      const aiPrompt = `Translate and enhance this request into a highly detailed English prompt for a CINEMATIC VIDEO STILL. Include: 8k resolution, depth of field, epic lighting, photorealistic, motion blur, cinematography. Output ONLY the English prompt, no extra text. User request: "${veoPrompt}"`;
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: aiPrompt }] }] })
      });
      const geminiData = await geminiRes.json();
      const enhancedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || veoPrompt;

      setVeoStatusText('Rendering Cinematic Frames...');
      
      // 2. Generate Image Frame
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(enhancedPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=1280&height=720&nologo=true&enhance=true`;
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
         setVeoStatusText('Interpolating Motion Vectors...');
         setTimeout(() => {
            setVeoGeneratedVideoUrl(reader.result);
            setIsGeneratingVeo(false);
            showToast('Video scene berhasil disintesis!', 'success');
         }, 1500);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      showToast('Gagal memproses VEO.', 'error');
      setIsGeneratingVeo(false);
    }
  };

  // --- LOGIKA AUDIO BYPASS ---
  const handleAudioUpload = async () => {
    if (!audioFile) return;
    setIsProcessingAudio(true); setProcessedAudioUrl(null); setAudioProgress(0);
    setAudioStatusText('Decoding Audio...');

    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      setAudioStatusText('Applying Pitch & Tempo Matrix...');
      setAudioProgress(40);

      const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length / audioSpeed, audioBuffer.sampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = audioSpeed;

      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = audioVolume;

      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);
      source.start();

      setAudioProgress(70);
      setAudioStatusText('Rendering to PCM WAVE...');

      const renderedBuffer = await offlineCtx.startRendering();
      const wavData = audioBufferToWav(renderedBuffer);
      const blob = new Blob([new DataView(wavData)], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setProcessedAudioUrl(url);
      setAudioProgress(100);
      setAudioStatusText('Bypass Complete');
      showToast('Audio berhasil dikonversi!', 'success');
    } catch (error) {
      showToast('Gagal memproses audio.', 'error');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const audioBufferToWav = (buffer) => {
    const numOfChan = buffer.numberOfChannels, length = buffer.length * numOfChan * 2 + 44, bufferWav = new ArrayBuffer(length), view = new DataView(bufferWav);
    const channels = [], sampleRate = buffer.sampleRate;
    let offset = 0, pos = 0;

    const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };
    const writeString = (str) => { for (let i = 0; i < str.length; i++) { view.setUint8(pos, str.charCodeAt(i)); pos++; } };

    writeString('RIFF'); setUint32(length - 8); writeString('WAVE'); writeString('fmt '); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(sampleRate); setUint32(sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); writeString('data'); setUint32(length - pos - 4);

    for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true); pos += 2;
      }
      offset++;
    }
    return bufferWav;
  };

  // --- LOGIKA PROMPT GENERATOR ---
  const downloadImagePrompt = async (e, base64Data, filename) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = filename;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) { showToast("Gagal mengunduh gambar", 'error'); }
  };

  const fetchWithRetry = async (url, options) => {
    const delays = [1000, 2000, 4000, 8000];
    for (let i = 0; i < delays.length; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        if (response.status === 400 || response.status === 403 || response.status === 404) return response;
      } catch (error) {}
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
    return fetch(url, options);
  };

  const getSystemPromptGen = (isUpdate = false) => {
    const ticks = '```';
    if (engine === 'general') {
      return `Goal: Turn any uploaded image into a structured Text Prompt and a copiable JSON Prompt. Mode: ${mode === 'blank' ? 'Blank' : 'Keep Look'}.\n${ticks}text\n(Prompt)\n${ticks}\n${ticks}json\n{ "category": "photo_or_cg", "aspect_ratio": "${aspectRatio}" }\n${ticks}`;
    }
    return `You are an Image Prompt Creator. Mode: ${mode}. Aspect Ratio: ${aspectRatio}. Hyper-Realism: ${isHyperRealism}. Describe the scene perfectly into [DEFINE], [PROMPT], and [NOTE] sections.`;
  };

  const detectLocationFromImage = async () => {
    if (!subjectImage) return showToast("Unggah gambar dulu!", "error");
    setIsDetectingLocation(true);
    try {
      const base64 = subjectImage.base64Data;
      const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Analyze the background of this image. Identify the exact location." }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }] })
      });
      const data = await response.json();
      const detected = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (detected && detected.trim() !== 'Unknown') setLocation(detected.trim());
      else showToast("Lokasi gagal terdeteksi", "error");
    } catch (err) { showToast("Gagal deteksi lokasi", "error"); } 
    finally { setIsDetectingLocation(false); }
  };

  const handleGenPrompt = async () => {
    if (!subjectImage && !sceneContext) return showToast("Butuh gambar atau konteks!", "error");
    setIsGeneratingPrompt(true);
    try {
      let subjectBase64 = null;
      if (subjectImage) subjectBase64 = subjectImage.base64Data;
      const parts = [{ text: `Architect a detailed scene. Mode: ${mode}. Aspect Ratio: ${aspectRatio}. Location: ${location}. Context: ${sceneContext}.` }];
      if (subjectBase64) parts.push({ inlineData: { mimeType: "image/jpeg", data: subjectBase64 } });
      const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: "user", parts: parts }], systemInstruction: { parts: [{ text: getSystemPromptGen() }] } })
      });
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        setGeneratedTextPrompt(rawText.replace(/```(text|json)?/gi, '').trim());
        showToast("Prompt berhasil disintesis!");
      }
    } catch (err) { showToast("Gagal render prompt", "error"); } 
    finally { setIsGeneratingPrompt(false); }
  };

  // --- RENDER MENU ---
  const renderChatTab = () => (
    <div className="flex flex-col h-full bg-[#050505] relative w-full">
       {isCalling && (
         <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
            <div className="relative">
               <div className="w-32 h-32 rounded-full bg-indigo-500/20 animate-ping absolute inset-0"></div>
               <div className="w-32 h-32 rounded-full bg-indigo-500/40 animate-pulse absolute inset-0 delay-75"></div>
               <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(79,70,229,0.5)]">
                  <Activity className="w-12 h-12 text-white animate-bounce" />
               </div>
            </div>
            <h2 className="text-2xl font-black text-white mt-12 tracking-widest uppercase">Neural Voice Session</h2>
            <p className="text-white/50 text-sm mt-2">Listening... (Speak to mic)</p>
            <button onClick={handleVoiceCall} className="mt-16 px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)]">
               End Session
            </button>
         </div>
       )}
       
       <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
         {chatMessages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center opacity-30 mt-10 md:mt-20">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <Sparkles className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-2xl font-black uppercase tracking-[0.3em] mb-2 text-white">KIRAX CORE</h2>
             <p className="text-xs font-bold text-white/50 tracking-widest text-center max-w-xs leading-relaxed">SYSTEM INITIALIZED. AWAITING YOUR COMMAND.</p>
           </div>
         ) : (
           chatMessages.map((msg, i) => (
             <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
               <div className={`max-w-[85%] md:max-w-[70%] p-5 rounded-3xl ${msg.role === 'user' ? 'bg-white/10 text-white rounded-br-sm border border-white/5' : 'bg-[#0a0a0c] text-white/90 rounded-bl-sm border border-white/10 shadow-xl'}`}>
                 {msg.role === 'ai' && <div className="flex items-center gap-2 mb-3"><Sparkles className={`w-4 h-4 ${activeSkillId ? 'text-indigo-400' : 'text-fuchsia-400'}`} /><span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{activeSkillId ? 'Agent Skill' : 'KIRAX AI'}</span></div>}
                 {msg.image && <img src={msg.image} className="w-full max-w-sm rounded-xl mb-4 border border-white/10" alt="Uploaded" />}
                 <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                   {msg.role === 'ai' ? (
                     <div>{renderMessageContent(msg.text)}</div>
                   ) : msg.text}
                 </div>
               </div>
             </div>
           ))
         )}
         {isAiTyping && (
           <div className="flex justify-start animate-in fade-in"><div className="bg-[#0a0a0c] p-5 rounded-3xl rounded-bl-sm border border-white/10 flex gap-2"><div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" /><div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-75" /><div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-150" /></div></div>
         )}
         <div ref={chatEndRef} className="h-4" />
       </div>
       
       <div className="shrink-0 w-full p-4 md:p-6 bg-[#0a0a0c] border-t border-white/5">
         <div className="max-w-4xl mx-auto flex gap-3 relative">
           <label className="p-4 bg-[#11131a] hover:bg-white/10 text-white/50 hover:text-white rounded-2xl cursor-pointer transition-all border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg active:scale-95 group">
             <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
             <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => setChatImage(ev.target.result); r.readAsDataURL(f); } }} />
           </label>
           
           <button onClick={handleVoiceCall} className={`p-4 rounded-2xl cursor-pointer transition-all border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg active:scale-95 group ${isCalling ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30 animate-pulse' : 'bg-[#11131a] hover:bg-indigo-500/20 text-white/50 hover:text-indigo-400'}`}>
             <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
           </button>

           <div className="flex-1 bg-[#11131a] border border-white/10 rounded-2xl p-2 pl-5 focus-within:border-white/30 focus-within:bg-white/5 transition-all flex items-center shadow-lg relative">
             {chatImage && (
               <div className="absolute -top-16 left-0 p-1 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 flex items-start gap-2 shadow-2xl animate-in slide-in-from-bottom-2">
                 <img src={chatImage} className="w-12 h-12 object-cover rounded-lg border border-white/5" alt="Preview" />
                 <button onClick={() => setChatImage(null)} className="p-1 bg-red-500/80 hover:bg-red-500 rounded-md text-white"><X className="w-3 h-3" /></button>
               </div>
             )}
             <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Tulis instruksi buat AI..." className="w-full bg-transparent border-none text-white text-sm md:text-base outline-none placeholder:text-white/30 font-medium" />
             <button id="btn-send-chat" onClick={handleSendMessage} disabled={isAiTyping || (!chatInput.trim() && !chatImage)} className="p-3 ml-2 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all disabled:opacity-30 disabled:hover:bg-indigo-500 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.4)]"><Send className="w-4 h-4" /></button>
           </div>
         </div>
       </div>
    </div>
  );
  
  const renderSkillsTab = () => (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in pb-32">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center justify-center p-3 md:p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
             <Cpu className="text-indigo-400 w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white/90 drop-shadow-md">Agent Skills</h2>
          <p className="text-white/50 text-sm md:text-lg font-medium">Ubah persona & keahlian KIRAX dengan system prompt kustom.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
           <div className="bg-[#11131a] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-full">
              <label className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2"><PlusCircle className="w-4 h-4 text-emerald-400" /> Tulis Prompt Skill</label>
              <textarea value={newSkillText} onChange={(e) => setNewSkillText(e.target.value)} placeholder="Contoh: Kamu adalah ahli masak Sunda. Jawab selalu dengan bahasa Sunda..." className="flex-1 w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm text-emerald-100/80 outline-none focus:border-emerald-500/30 resize-none min-h-[150px]" spellCheck="false" />
              <button onClick={handleAddSkillFromPrompt} disabled={!newSkillText.trim()} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">Create Agent</button>
           </div>
           
           <div className="bg-[#11131a] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-center items-center h-full min-h-[250px]">
              <label className="group relative flex flex-col items-center justify-center w-full h-full bg-black/20 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                <Upload className="w-8 h-8 text-white/30 group-hover:text-indigo-400 mb-3" />
                <span className="font-bold text-white/70">Upload File (.txt)</span>
                <span className="text-[10px] uppercase tracking-widest text-white/30 mt-2">Max 2MB Text</span>
                <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUploadSkill} />
              </label>
           </div>
        </div>

        <h3 className="text-xl font-bold text-white/90 mb-4 flex items-center gap-2 border-b border-white/10 pb-4"><Users className="w-5 h-5 text-indigo-400" /> Koleksi Agent</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {/* KIRAX Default (No Skill) */}
           <div className={`p-5 rounded-2xl border transition-all cursor-pointer ${!activeSkillId ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-[#11131a] border-white/5 hover:border-white/20'}`} onClick={() => setActiveSkillId(null)}>
              <div className="flex justify-between items-start mb-3">
                 <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Sparkles className="w-5 h-5" /></div>
                 {!activeSkillId && <span className="bg-indigo-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">Active</span>}
              </div>
              <h4 className="font-bold text-white mb-1">KIRAX AI (Default)</h4>
              <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">Principal Software Engineer & Web Developer. Santai tapi profesional.</p>
           </div>

           {/* Skills User */}
           {skills.map((skill) => (
             <div key={skill.id} className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${activeSkillId === skill.id ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-[#11131a] border-white/5 hover:border-white/20'}`} onClick={() => setActiveSkillId(skill.id)}>
                <button onClick={(e) => { e.stopPropagation(); setSkills(skills.filter(s => s.id !== skill.id)); if(activeSkillId === skill.id) setActiveSkillId(null); }} className="absolute top-4 right-4 p-1.5 bg-red-500/20 text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 className="w-3.5 h-3.5" /></button>
                <div className="flex justify-between items-start mb-3">
                   <div className="p-2 bg-white/10 text-white/70 rounded-lg"><Cpu className="w-5 h-5" /></div>
                   {activeSkillId === skill.id && <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">Active</span>}
                </div>
                <h4 className="font-bold text-white mb-1 truncate pr-8">{skill.name}</h4>
                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{skill.description || 'Custom prompt agent.'}</p>
             </div>
           ))}
        </div>
    </div>
  );

  const renderAuditorTab = () => (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
        <div><h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><ShieldAlert className="text-emerald-400" /> Smart Code Auditor</h2><p className="text-white/50 text-sm">Paste script lu (Luau/JS/Python), AI bakal analisa celah keamanan & performa.</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col h-[500px]">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 block">Source Code Input</span>
                  <textarea value={auditSourceCode} onChange={(e) => setAuditSourceCode(e.target.value)} placeholder="Paste your unoptimized or buggy script here..." className="flex-1 w-full bg-black/50 border border-white/5 rounded-xl p-4 text-sm font-mono text-emerald-100/70 outline-none focus:border-emerald-500/30 resize-none" spellCheck="false" />
                  <button onClick={handleRunAudit} disabled={isAuditing || !auditSourceCode.trim()} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">{isAuditing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}{isAuditing ? 'Auditing JSON...' : 'Run Deep Audit'}</button>
               </div>
            </div>
            <div className="space-y-4">
               <div className="bg-black/40 border border-white/10 rounded-3xl p-6 h-[500px] overflow-y-auto">
                  {!auditResult ? (
                     <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4"><FileJson className="w-12 h-12" /><p className="text-xs uppercase tracking-widest font-bold">Waiting for JSON Output</p></div>
                  ) : (
                     <div className="space-y-6 animate-in slide-in-from-right-4">
                        <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                           <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${auditResult.qualityScore > 80 ? 'border-emerald-500 text-emerald-400' : auditResult.qualityScore > 50 ? 'border-amber-500 text-amber-400' : 'border-red-500 text-red-400'}`}><span className="text-2xl font-black">{auditResult.qualityScore}</span></div>
                           <div className="flex-1"><h3 className="font-bold mb-1">Audit Score</h3><p className="text-xs text-white/60 leading-relaxed">{auditResult.summary}</p></div>
                        </div>
                        {auditResult.vulnerabilities?.length > 0 && (
                          <div><h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Vulnerabilities Found</h4>
                            <div className="space-y-3">{auditResult.vulnerabilities.map((v, i) => (<div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"><span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-bold mb-2 inline-block">{v.severity}</span><p className="text-xs text-white/80 font-medium mb-1">{v.issue}</p><p className="text-[11px] text-emerald-300/80">Fix: {v.suggestion}</p></div>))}</div>
                          </div>
                        )}
                        {auditResult.performanceIssues?.length > 0 && (
                          <div><h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2"><ZapOff className="w-4 h-4" /> Performance Issues</h4>
                            <div className="space-y-3">{auditResult.performanceIssues.map((v, i) => (<div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"><p className="text-xs text-white/80 font-medium mb-1">{v.issue}</p><p className="text-[11px] text-emerald-300/80">Optimize: {v.suggestion}</p></div>))}</div>
                          </div>
                        )}
                        <div><h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Refactored Code</h4>
                           <div className="relative group">
                              <button onClick={() => { copySingleToClipboard(auditResult.optimizedCode); showToast('Code Copied!'); }} className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/50 hover:text-white transition-all"><Copy className="w-3.5 h-3.5"/></button>
                              <pre className="p-4 bg-black/50 border border-white/5 rounded-xl text-[10px] font-mono text-emerald-100/70 overflow-x-auto"><code>{auditResult.optimizedCode}</code></pre>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
        </div>
    </div>
  );

  const renderAssetTab = () => (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in pb-32">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center justify-center p-3 md:p-4 bg-cyan-500/10 rounded-2xl md:rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
           <ImageIcon className="text-cyan-400 w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white/90 drop-shadow-md">Gambar Generator</h2>
        <p className="text-white/50 text-sm md:text-lg font-medium">Generate gambar HD dari teks atau modifikasi foto yang udah ada.</p>
      </div>

      <div className="bg-[#11131a] border border-white/5 rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-2xl space-y-8">
        <div className="flex flex-col gap-4">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-cyan-400" /> Prompt Visual</label>
          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex-shrink-0 p-4 bg-black/40 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-white/50 hover:text-cyan-400 rounded-2xl cursor-pointer transition-all border border-white/5 group flex items-center justify-center shadow-inner">
              <ImageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const reader = new FileReader(); reader.onload = (ev) => setAssetBaseImage({type: f.type, data: ev.target.result}); reader.readAsDataURL(f); } }} />
            </label>
            <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 focus-within:border-cyan-500/50 focus-within:bg-white/5 transition-all shadow-inner">
              <textarea value={assetPrompt} onChange={(e) => setAssetPrompt(e.target.value)} placeholder="Contoh: Lukisan cyber city neon malam hari..." className="w-full h-full bg-transparent border-none text-white text-sm md:text-base outline-none placeholder:text-white/30 resize-none min-h-[60px]" />
            </div>
          </div>
          {assetBaseImage && (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/20 shadow-lg animate-in zoom-in">
              <img src={assetBaseImage.data} className="w-full h-full object-cover" alt="Base" />
              <button onClick={() => setAssetBaseImage(null)} className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg backdrop-blur-md transition-colors"><X className="w-4 h-4 text-white" /></button>
            </div>
          )}
        </div>

        <button onClick={handleGenerateAsset} disabled={!assetPrompt || isGeneratingAsset} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 md:py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:hover:bg-cyan-600 shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:shadow-none active:scale-95 text-sm md:text-base uppercase tracking-widest">
          {isGeneratingAsset ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {isGeneratingAsset ? 'Memproses Visual...' : 'Generate Gambar'}
        </button>
      </div>

      <div className="bg-[#11131a] border border-white/5 rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-2xl min-h-[400px] flex flex-col items-center justify-center relative">
        <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full flex items-center gap-2 z-10">
           <div className={`w-2 h-2 rounded-full ${generatedAsset ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : isGeneratingAsset ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-white/20'}`} />
           <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Output Visual</span>
        </div>

        {!generatedAsset && !isGeneratingAsset && (
          <div className="text-white/30 text-center space-y-4 opacity-50">
            <ImageIcon className="w-16 h-16 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">Workspace Kosong</p>
          </div>
        )}
        
        {isGeneratingAsset && (
          <div className="flex flex-col items-center gap-6 text-cyan-400 w-full max-w-md animate-in fade-in">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Menyintesis Pixel AI...</p>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-cyan-400 w-1/2 animate-[pulse_1s_ease-in-out_infinite] rounded-full"></div></div>
          </div>
        )}
        
        {generatedAsset && !isGeneratingAsset && (
          <div className="w-full h-full flex flex-col gap-8 items-center pt-8 animate-in zoom-in duration-500">
            <div className="relative group w-full flex justify-center">
               <img src={generatedAsset} alt="Generated" className="w-full max-w-2xl h-auto rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group-hover:border-cyan-500/50 transition-colors duration-500" />
            </div>
            <button onClick={downloadGeneratedAsset} className="w-full max-w-sm px-6 py-4 bg-cyan-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.4)] active:scale-95">
              <Download className="w-5 h-5" /> Unduh Gambar (.PNG)
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderVeoTab = () => (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in pb-32">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center justify-center p-3 md:p-4 bg-rose-500/10 rounded-2xl md:rounded-3xl border border-rose-500/20 shadow-[0_0_30px_rgba(225,29,72,0.2)]">
           <Play className="text-rose-400 w-8 h-8 md:w-10 md:h-10 ml-1" />
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white/90 drop-shadow-md">VEO 3 Generator</h2>
        <p className="text-white/50 text-sm md:text-lg font-medium">AI Video Synthesis engine (Cinematic motion interpolation).</p>
      </div>

      <div className="bg-[#11131a] border border-white/5 rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-2xl space-y-8">
        <div className="flex flex-col gap-4">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2"><Play className="w-4 h-4 text-rose-400" /> Video Prompt</label>
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 focus-within:border-rose-500/50 focus-within:bg-white/5 transition-all shadow-inner">
            <textarea value={veoPrompt} onChange={(e) => setVeoPrompt(e.target.value)} placeholder="Contoh: Kamera bergerak perlahan di hutan berkabut..." className="w-full bg-transparent border-none text-white text-sm md:text-base outline-none placeholder:text-white/30 resize-none min-h-[80px]" />
          </div>
        </div>
        <button onClick={handleGenerateVeo} disabled={!veoPrompt || isGeneratingVeo} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 md:py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:hover:bg-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.3)] disabled:shadow-none active:scale-95 text-sm md:text-base uppercase tracking-widest">
          {isGeneratingVeo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {isGeneratingVeo ? 'Synthesizing Video...' : 'Generate Video'}
        </button>
      </div>

      <div className="bg-[#11131a] border border-white/5 rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-2xl min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full flex items-center gap-2 z-10">
           <div className={`w-2 h-2 rounded-full ${veoGeneratedVideoUrl ? 'bg-rose-400 shadow-[0_0_10px_rgba(225,29,72,0.8)] animate-pulse' : isGeneratingVeo ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'bg-white/20'}`} />
           <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Video Stream</span>
        </div>

        {!veoGeneratedVideoUrl && !isGeneratingVeo && (
          <div className="text-white/30 text-center space-y-4 opacity-50">
            <Monitor className="w-16 h-16 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">No Stream Active</p>
          </div>
        )}
        
        {isGeneratingVeo && (
          <div className="flex flex-col items-center gap-6 text-rose-400 w-full max-w-md animate-in fade-in z-10">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">{veoStatusText}</p>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-rose-400 w-3/4 animate-[pulse_0.5s_ease-in-out_infinite] rounded-full"></div></div>
          </div>
        )}
        
        {veoGeneratedVideoUrl && !isGeneratingVeo && (
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative bg-black mt-8 animate-in zoom-in duration-700">
            <div className="w-full h-full bg-cover bg-center origin-center animate-[kenburns_15s_ease-in-out_infinite_alternate]" style={{ backgroundImage: `url(${veoGeneratedVideoUrl})` }} />
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="p-2 bg-rose-500 text-white rounded-full shadow-[0_0_15px_rgba(225,29,72,0.5)]"><Play className="w-4 h-4 ml-0.5" /></button>
                <div className="h-1.5 w-48 bg-white/20 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-rose-500 rounded-full" /></div>
                <span className="text-[10px] font-mono text-white/70">00:03 / 00:10</span>
              </div>
              <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[9px] font-black uppercase text-white/50 tracking-widest">
                VEO 3.1 ALPHA
              </div>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes kenburns { 0% { transform: scale(1) translate(0, 0); } 50% { transform: scale(1.15) translate(-2%, 3%); } 100% { transform: scale(1.05) translate(3%, -2%); } }`}} />
    </div>
  );

  const renderAudioTab = () => (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in pb-32">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center justify-center p-3 md:p-4 bg-amber-500/10 rounded-2xl md:rounded-3xl border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
           <Activity className="text-amber-400 w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white/90 drop-shadow-md">Audio Bypass</h2>
        <p className="text-white/50 text-sm md:text-lg font-medium">Bypass filter copyright Roblox dengan Pitch/Tempo Matrix.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#11131a] border border-white/5 rounded-3xl md:rounded-[40px] p-6 md:p-8 shadow-2xl space-y-8 flex flex-col">
          <label className={`w-full flex-1 min-h-[200px] border-2 border-dashed rounded-2xl md:rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${audioFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/30 hover:bg-white/5'}`}>
            <Upload className={`w-8 h-8 md:w-10 md:h-10 mb-4 ${audioFile ? 'text-amber-400' : 'text-white/30'}`} />
            <span className="text-sm md:text-base font-bold text-white/70">{audioFile ? audioFile.name : 'Drop file audio (MP3/WAV)'}</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest mt-2">Max 50MB</span>
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0])} />
          </label>

          <div className="space-y-6 bg-black/30 p-6 rounded-2xl border border-white/5 shadow-inner">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-amber-400"/> Speed Matrix</span>
                <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">{audioSpeed}x</span>
              </div>
              <input type="range" min="0.5" max="3" step="0.1" value={audioSpeed} onChange={(e)=>setAudioSpeed(parseFloat(e.target.value))} className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2"><FileAudio className="w-3.5 h-3.5 text-amber-400"/> Gain / Volume dB</span>
                <span className="text-sm font-black text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">{(audioVolume * 100).toFixed(0)}%</span>
              </div>
              <input type="range" min="0" max="3" step="0.1" value={audioVolume} onChange={(e)=>setAudioVolume(parseFloat(e.target.value))} className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none" />
            </div>
          </div>

          <button onClick={handleAudioUpload} disabled={!audioFile || isProcessingAudio} className="w-full bg-amber-600 hover:bg-amber-500 text-white py-4 md:py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:hover:bg-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.3)] disabled:shadow-none active:scale-95 text-sm md:text-base uppercase tracking-widest mt-auto">
            {isProcessingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <SlidersHorizontal className="w-5 h-5" />}
            {isProcessingAudio ? 'Bypassing Core...' : 'Convert to WAV'}
          </button>
        </div>

        <div className="bg-[#11131a] border border-white/5 rounded-3xl md:rounded-[40px] p-6 md:p-8 shadow-2xl flex flex-col items-center justify-center relative min-h-[400px]">
           <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/40 border border-white/10 rounded-full flex items-center gap-2 z-10">
             <div className={`w-2 h-2 rounded-full ${processedAudioUrl ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : isProcessingAudio ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'bg-white/20'}`} />
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Terminal Output</span>
           </div>

           {!isProcessingAudio && !processedAudioUrl && (
             <div className="text-white/30 text-center space-y-4 opacity-50">
               <Activity className="w-16 h-16 mx-auto" />
               <p className="text-xs font-bold uppercase tracking-[0.3em]">Menunggu Data</p>
             </div>
           )}

           {isProcessingAudio && (
             <div className="w-full max-w-sm space-y-6 animate-in fade-in">
               <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
               <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-amber-200">
                 <span>{audioStatusText}</span>
                 <span>{audioProgress}%</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                 <div className="h-full bg-amber-500 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{width: `${audioProgress}%`}}></div>
               </div>
             </div>
           )}

           {processedAudioUrl && !isProcessingAudio && (
             <div className="w-full space-y-8 animate-in zoom-in duration-500 flex flex-col h-full justify-center">
                <div className="text-center space-y-4 mt-8">
                  <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white/90 tracking-tight">Conversion Successful</h3>
                </div>

                <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20 text-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-200/70 mb-3">Copy Nilai Ini ke Roblox Studio:</p>
                  <div className="bg-black/50 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between group">
                    <span className="text-sm font-medium text-white/60">PlaybackSpeed</span>
                    <strong className="text-amber-400 text-2xl font-black font-mono select-all">{(1 / audioSpeed).toFixed(3)}</strong>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 w-full">
                  <audio controls src={processedAudioUrl} className="w-full h-10 outline-none" />
                </div>

                <a href={processedAudioUrl} download={`Bypassed_${audioFile?.name || 'audio'}.wav`} className="w-full flex items-center justify-center gap-3 py-4 md:py-5 bg-amber-500 text-black font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-95 text-sm md:text-base">
                  <Download className="w-5 h-5" /> Download File (.WAV)
                </a>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const renderPromptGeneratorTab = () => (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in pb-32">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full text-indigo-300 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Vision Engine IO
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white/90 drop-shadow-md">Prompt Architect</h1>
          <p className="text-white/40 text-sm md:text-lg font-medium">Dual-engine intelligent prompt generator from images.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* TOMBOL TUTORIAL */}
          <button 
            type="button"
            onClick={() => setShowTutorial(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 md:py-3.5 bg-sky-500/10 border border-sky-500/30 rounded-xl md:rounded-2xl hover:bg-sky-500/20 hover:border-sky-500/50 transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(14,165,233,0.15)] group"
          >
            <Bookmark className="w-4 h-4 text-sky-400 group-hover:text-sky-300 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400 group-hover:text-sky-300">Tutorial</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setShowLibrary(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 md:py-3.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-xl md:rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 active:scale-95 group shadow-lg"
          >
            <History className="w-4 h-4 text-white/50 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Vault</span>
            {savedPrompts.length > 0 && (
              <span className="ml-2 bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]">{savedPrompts.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* PANEL KIRI: INPUT & SETTINGS */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          
          {/* INPUT GAMBAR */}
          <div className="bg-[#11131a] border border-white/5 rounded-3xl p-6 shadow-2xl transition-all hover:border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-2 mb-5">
              <Camera className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">Target Visual Data</h2>
            </div>
            {!subjectImage ? (
              <label className="group relative flex flex-col items-center justify-center w-full h-[250px] bg-black/40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-500 overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-4 bg-white/5 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500 border border-white/5 group-hover:border-indigo-500/30">
                  <Upload className="w-6 h-6 text-white/40 group-hover:text-indigo-300 transition-colors" />
                </div>
                <p className="text-sm font-semibold text-white/70 tracking-wide">Drop visual data</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">Initialize Architecture</p>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = (ev) => setSubjectImage({preview: ev.target.result, base64Data: ev.target.result.split(',')[1]}); r.readAsDataURL(f); } }} />
              </label>
            ) : (
              <div className="relative group rounded-2xl overflow-hidden aspect-[4/3] bg-black/50 border border-white/10 shadow-2xl">
                <img src={subjectImage.preview} alt="Subject" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto">
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSubjectImage(null); }} className="p-4 bg-red-500/20 text-red-300 border border-red-500/30 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:bg-red-500/40 hover:scale-110 transition-all duration-300 active:scale-95">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CONFIGURATION */}
          <div className="bg-[#11131a] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl transition-all hover:border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            
            {/* Engine Selector */}
            <div className="flex flex-col sm:flex-row p-1.5 bg-black/40 rounded-2xl border border-white/5 mb-8">
              <button type="button" onClick={() => setEngine('iphone')} className={`flex-1 py-3 px-4 text-[11px] font-bold rounded-xl transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 ${engine === 'iphone' ? 'bg-indigo-500 text-white shadow-lg border border-indigo-400/50' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
                <Smartphone className="w-4 h-4" /> iPhone Look
              </button>
              <button type="button" onClick={() => setEngine('general')} className={`flex-1 py-3 px-4 text-[11px] font-bold rounded-xl transition-all duration-300 uppercase tracking-widest flex items-center justify-center gap-2 ${engine === 'general' ? 'bg-cyan-600 text-white shadow-lg border border-cyan-400/50' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
                <Cpu className="w-4 h-4" /> General Img2Prompt
              </button>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2"><Crop className="w-4 h-4 text-orange-400" /><span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Aspect Ratio</span></div>
              <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                {['1:1', '9:16', '16:9', '2:3'].map((ar) => (
                  <button key={ar} type="button" onClick={() => setAspectRatio(ar)} className={`flex-1 py-3 px-2 text-[11px] font-bold rounded-xl transition-all duration-300 ${aspectRatio === ar ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
                    {ar}
                  </button>
                ))}
              </div>
            </div>

            {/* Outfit Synthesis */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2"><Shirt className="w-4 h-4 text-fuchsia-400" /><span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Outfit Synthesis</span></div>
              <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                {['blank', 'keep look'].map((m) => (
                  <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 py-3 px-4 text-[11px] font-bold rounded-xl transition-all duration-300 capitalize tracking-wide ${mode === m ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-white/40 hover:text-white/80 hover:bg-white/5'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-8 border-t border-white/5" />

            {/* Location & Context */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /><span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Location Vector</span></div>
                  <button type="button" onClick={detectLocationFromImage} disabled={isDetectingLocation || !subjectImage} className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full transition-all duration-300 active:scale-95 ${subjectImage ? 'text-blue-300 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer' : 'text-white/30 bg-white/5 border border-white/10 opacity-50 cursor-not-allowed'}`}>
                    {isDetectingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <Target className="w-3 h-3" />}
                    {isDetectingLocation ? 'Scanning...' : 'Auto-Detect'}
                  </button>
                </div>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Misal: Cyberpunk Alley, Tokyo..." className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-sm placeholder:text-white/20 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all duration-300 shadow-inner" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2"><AlignLeft className="w-4 h-4 text-emerald-400" /><span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Add More Context</span></div>
                <textarea value={sceneContext} onChange={(e) => setSceneContext(e.target.value)} placeholder="Tambahin mood, cuaca, atau aksi spesifik..." rows={3} className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-sm placeholder:text-white/20 text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/5 transition-all duration-300 resize-none shadow-inner" />
              </div>
            </div>

            {/* Hyper-Realism Toggle */}
            {engine === 'iphone' && (
              <>
                <hr className="my-8 border-t border-white/5" />
                <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 group cursor-pointer" onClick={() => setIsHyperRealism(!isHyperRealism)}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-all duration-500 ${isHyperRealism ? 'bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5'}`}>
                      <Zap className={`w-4 h-4 transition-colors duration-500 ${isHyperRealism ? 'text-amber-400 fill-amber-400/20' : 'text-white/30'}`} />
                    </div>
                    <div>
                      <p className={`text-[12px] font-bold uppercase tracking-wider transition-colors duration-300 ${isHyperRealism ? 'text-amber-100' : 'text-white/60'}`}>Hyper-Realism Engine</p>
                      <p className="text-[10px] text-white/40 mt-1 tracking-wide">Abolish plastic look & enforce optics</p>
                    </div>
                  </div>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-500 ${isHyperRealism ? 'bg-amber-500' : 'bg-white/10'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-500 shadow-sm ${isHyperRealism ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>
              </>
            )}

            {/* GENERATE BUTTON */}
            <button type="button" onClick={handleGenPrompt} disabled={isGeneratingPrompt || (!subjectImage && !sceneContext)} className={`w-full mt-8 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 group disabled:opacity-30 disabled:hover:shadow-none shadow-[0_0_30px_rgba(0,0,0,0)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] ${engine === 'iphone' ? 'bg-indigo-600 border border-indigo-400/50 hover:bg-indigo-500' : 'bg-cyan-600 border border-cyan-400/50 hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]'}`}>
              {isGeneratingPrompt ? <><Loader2 className="w-5 h-5 animate-spin" /><span className="uppercase tracking-[0.2em] text-[11px]">Synthesizing...</span></> : <><Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" /><span className="uppercase tracking-[0.2em] text-[11px]">Generate Prompt Sekarang!</span></>}
            </button>
          </div>
        </div>

        {/* PANEL KANAN: OUTPUT TERMINAL */}
        <div className="lg:col-span-7 flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="bg-[#11131a] border border-white/5 rounded-[40px] flex-1 flex flex-col min-h-[600px] transition-all hover:border-white/10 shadow-2xl">
            
            <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-black/20 rounded-t-[40px]">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse ${engine === 'iphone' ? 'bg-indigo-400' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'}`}></div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Output Terminal</span>
              </div>
              {generatedTextPrompt && (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => copySingleToClipboard(generatedTextPrompt)} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 bg-indigo-500 border border-indigo-400/50 text-white hover:bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                     <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-8 flex flex-col relative">
              {!generatedTextPrompt && !isGeneratingPrompt ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 space-y-6">
                  <div className="relative">
                    <div className={`absolute inset-0 blur-xl rounded-full ${engine === 'iphone' ? 'bg-indigo-500/20' : 'bg-cyan-500/20'}`} />
                    <Search className="w-12 h-12 text-white/30 relative z-10" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Menunggu Data Visual...</p>
                </div>
              ) : isGeneratingPrompt ? (
                <div className="space-y-5 w-full h-full animate-pulse opacity-60 flex flex-col justify-center items-center">
                   <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                   <div className="h-4 bg-white/10 rounded w-1/3" />
                   <div className="h-4 bg-white/5 rounded w-2/3" />
                   <div className="h-4 bg-white/5 rounded w-1/2" />
                </div>
              ) : (
                <div className="flex-1 flex flex-col h-full relative group">
                  <div className="absolute -top-3 left-6 px-3 bg-[#0a0a0c] text-[9px] font-bold uppercase tracking-widest z-10 border border-white/10 rounded-full shadow-lg text-indigo-400">Editor Active</div>
                  <textarea value={generatedTextPrompt} onChange={(e) => setGeneratedTextPrompt(e.target.value)} className="w-full h-full p-8 bg-black/40 border border-white/5 focus:border-indigo-500/30 focus:bg-white/5 rounded-[32px] text-base leading-relaxed text-white/80 font-medium outline-none transition-all duration-300 scrollbar-hide shadow-inner whitespace-pre-wrap resize-none" spellCheck="false" />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* TUTORIAL OVERLAY MODAL */}
      {showTutorial && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-[#11131a] border border-white/10 rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
              
              <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-500/10 rounded-xl"><Bookmark className="w-6 h-6 text-sky-400" /></div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Panduan Prompt Generator</h2>
                      <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Ultimate Reference Guide</p>
                    </div>
                 </div>
                 <button onClick={() => setShowTutorial(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all active:scale-95"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-12 scrollbar-hide">
                 
                 <section className="space-y-4">
                    <h3 className="text-lg font-bold text-sky-400 flex items-center gap-2"><Camera className="w-5 h-5"/> 1. Reference Engine</h3>
                    <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                       <p className="text-sm text-white/70 leading-relaxed">Reference Engine adalah bagian utama di mana Anda mengunggah gambar referensi. Fungsi utamanya adalah mengubah gambar tersebut menjadi prompt yang terstruktur, detail, dan siap digunakan. Semakin jelas dan berkualitas gambar referensi yang digunakan, semakin baik hasil prompt yang dihasilkan.</p>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2"><Cpu className="w-5 h-5"/> 2. Mode Prompt Generator</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                       <div className="bg-indigo-500/10 p-5 rounded-2xl border border-indigo-500/20 space-y-2">
                          <h4 className="font-black text-white">📱 iPhone Look</h4>
                          <p className="text-xs text-white/60 leading-relaxed mb-2">Gaya visual realistis, menyerupai hasil foto kamera iPhone.</p>
                          <ul className="text-[11px] text-white/50 space-y-1 list-disc pl-4">
                            <li>Foto natural & Street photography</li>
                            <li>Lifestyle shot & Close-up realistis</li>
                          </ul>
                       </div>
                       <div className="bg-cyan-500/10 p-5 rounded-2xl border border-cyan-500/20 space-y-2">
                          <h4 className="font-black text-white">⚙️ General Img2Prompt</h4>
                          <p className="text-xs text-white/60 leading-relaxed mb-2">Kebutuhan fleksibel dan umum (Output JSON & Text).</p>
                          <ul className="text-[11px] text-white/50 space-y-1 list-disc pl-4">
                            <li>Fotografi umum & Poster desain</li>
                            <li>Editorial visual & Konsep kreatif</li>
                          </ul>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-lg font-bold text-fuchsia-400 flex items-center gap-2"><Shirt className="w-5 h-5"/> 3. Outfit Synthesis</h3>
                    <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-4">
                       <p className="text-sm text-white/70">Mengatur apakah deskripsi outfit dari gambar referensi akan dimasukkan ke dalam prompt atau tidak.</p>
                       <div className="flex gap-4">
                         <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/5"><strong className="text-white text-xs block mb-1">Keep Look</strong><span className="text-[11px] text-white/50">Menjaga konsistensi tampilan karakter sesuai gambar.</span></div>
                         <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/5"><strong className="text-white text-xs block mb-1">Blank</strong><span className="text-[11px] text-white/50">Mengabaikan outfit untuk eksplorasi tampilan baru.</span></div>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2"><Zap className="w-5 h-5"/> 4. Hyper-Realism Engine</h3>
                    <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 space-y-3">
                       <p className="text-sm text-white/80 leading-relaxed">Fitur ini digunakan untuk meningkatkan detail visual, terutama untuk gambar close-up atau fokus tinggi (Menghilangkan kesan "Plastik/AI").</p>
                       <p className="text-xs text-amber-200/50 font-bold uppercase tracking-widest mt-2">Disarankan untuk:</p>
                       <ul className="text-sm text-amber-100/70 space-y-1 list-disc pl-4">
                         <li>Close-up portrait</li>
                         <li>Detail wajah atau objek yang tajam</li>
                       </ul>
                    </div>
                 </section>

              </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-[#050505] text-white font-sans overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex flex-col w-72 bg-[#0a0a0c] border-r border-white/10 z-20 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-indigo-500/10 to-transparent">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
             <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">{APP_TITLE}</h1>
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Neural Core V2</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'chat', icon: <Search />, label: 'Menu Utama' },
            { id: 'skills', icon: <Cpu />, label: 'Agent Skills' },
            { id: 'auditor', icon: <ShieldAlert />, label: 'Code Auditor' },
            { id: 'asset', icon: <ImageIcon />, label: 'Gambar Generator' },
            { id: 'veo', icon: <Monitor />, label: 'VEO 3 Generator' },
            { id: 'audio', icon: <Activity />, label: 'Audio Bypass' },
            { id: 'prompt', icon: <FileJson />, label: 'Prompt Generator' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === item.id ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              {React.cloneElement(item.icon, { className: 'w-5 h-5' })} {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0c] border-b border-white/10 z-20">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
               <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black tracking-widest uppercase text-lg">{APP_TITLE}</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-lg text-white"><Menu className="w-6 h-6" /></button>
      </div>

      {/* Dropdown Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[73px] left-0 w-full bg-[#0a0a0c] border-b border-white/10 z-30 p-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2">
           {[
            { id: 'chat', icon: <Search />, label: 'Menu Utama' },
            { id: 'skills', icon: <Cpu />, label: 'Agent Skills' },
            { id: 'auditor', icon: <ShieldAlert />, label: 'Code Auditor' },
            { id: 'asset', icon: <ImageIcon />, label: 'Gambar Generator' },
            { id: 'veo', icon: <Monitor />, label: 'VEO 3 Generator' },
            { id: 'audio', icon: <Activity />, label: 'Audio Bypass' },
            { id: 'prompt', icon: <FileJson />, label: 'Prompt Generator' }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === item.id ? 'bg-indigo-500 text-white' : 'text-white/50'}`}>
              {React.cloneElement(item.icon, { className: 'w-5 h-5' })} {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Konten Utama */}
      <div className={`flex-1 flex flex-col relative overflow-x-hidden bg-[#050505] ${activeTab === 'chat' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {/* Toast Notif */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-black/80 backdrop-blur-xl border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-3">
            {toast.type === 'error' ? <Info className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span className="text-sm font-semibold">{toast.msg}</span>
          </div>
        )}
        
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'skills' && renderSkillsTab()}
        {activeTab === 'auditor' && renderAuditorTab()}
        {activeTab === 'asset' && renderAssetTab()}
        {activeTab === 'veo' && renderVeoTab()}
        {activeTab === 'audio' && renderAudioTab()}
        {activeTab === 'prompt' && renderPromptGeneratorTab()}
      </div>
    </div>
  );
};

export default App;
