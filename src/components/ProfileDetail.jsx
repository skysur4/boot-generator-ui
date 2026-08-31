import React from "react";

import {
    LayersPlus, LayersMinus,
} from "lucide-react";
import ToggleField from "./ToggleField";
import DateTimeDisplay from "./DateTimeDisplay";
import { toTitleCase } from '../common/StringUtils';

/* =========================================================
 * Predefined
 * ======================================================= */
const SELECT_OPTIONS = {
    authenticatorType: [
        "KEYCLOAK",
        "GOOGLE",
        "NAVER",
        "KAKAO"
    ],

    messageBroker: [
        "APP",
        "KAFKA",
        "REDIS"
    ],

    responsibilitySegregation: [
        "BOTH",
        "COMMAND",
        "QUERY"
    ],

    orm: [
        "JPA",
        "MYBATIS"
    ]
};

/* =========================================================
 * Helpers
 * ======================================================= */

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isDateString(value) {
    if (typeof value !== "string") return false;

    // 2025.08.28
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(value)) return true;

    // 2025-08-28
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;

    return false;
}

function toDateInputValue(value) {
    if (!value) return "";

    // Convert 2025.08.28 -> 2025-08-28
    if (/^\d{4}\.\d{2}\.\d{2}$/.test(value)) {
        return value.replaceAll(".", "-");
    }

    return value;
}

function fromDateInputValue(value, originalValue) {
    if (!value) return "";

    // Preserve the original profile's format.
    // If original was 2025.08.28, save as 2026.08.28.
    if (
        typeof originalValue === "string" &&
        /^\d{4}\.\d{2}\.\d{2}$/.test(originalValue)
    ) {
        return value.replaceAll("-", ".");
    }

    return value;
}

function removeAt(array, index) {
    return array.filter((_, i) => i !== index);
}

/* =========================================================
 * Default objects for [Add]
 * ======================================================= */

function createEmptyExternalConnector() {
    return {
        name: "new-connector",
        domain: "localhost",
        port: 8080,
    };
}

function createEmptyProject() {
    return {
        id: null,
        basePath: "..",
        name: "new-project",
        group: "",
        desc: "",
        responsibilitySegregation: "BOTH",

        orm: {
            type: "JPA",
            showSql: false,
            formatSql: false,
            useSqlComments: false,
        },

        hikari: {
            driverClassName: null,
            jdbcUrl: null,
            username: null,
            password: null,
        },

        schemaFilter: "public",
        tableFilter: "%",
        columnFilter: "%",
        localPort: 8080,

        interServers: [],

        eventPublishers: [],

        enabled: {
            orm: false,
            event: false,
            notification: false,
            swagger: false,
            monitoring: false,
            hexagonal: false,
            authentication: false,
            session: false,
        },
    };
}

function createEmptyInterServer() {
    return {
        name: "new-server",
        url: "http://localhost:8080",
        artifact: "",
        domains: [],
        responsibilitySegregation: "BOTH",
    };
}

/* =========================================================
 * Basic Form Fields
 * ======================================================= */
function SelectField({
                         label,
                         value,
                         options,
                         onChange,
                     }) {
    return (
        <div className="mb-3">
            <div className="border-l-4 border-indigo-600 pl-4 mb-1">
                <h2 className="font-bold text-slate-500">
                    {toTitleCase(label)}
                </h2>
            </div>
            <select
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="
                    w-full border rounded px-3 py-2
                    bg-white dark:bg-zinc-800
                    border-gray-300 dark:border-zinc-700
                "
            >
                <option value="">
                    -- Select {toTitleCase(label)} --
                </option>

                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function RadioField({
                        label,
                        value,
                        options,
                        onChange,
                        name,
                    }) {
    return (
        <div className="mb-3">
            <div className="border-l-4 border-indigo-600 pl-4 mb-1">
                <h2 className="font-bold text-slate-500">
                    {toTitleCase(label)}
                </h2>
            </div>
            <div className="flex flex-wrap gap-4 px-3 py-2
                    border rounded bg-white dark:bg-zinc-800
                    border-gray-300 dark:border-zinc-700">
                {options.map((option) => (
                    <label
                        key={option}
                        className="
                            inline-flex items-center gap-2
                            cursor-pointer
                        "
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option}
                            checked={value === option}
                            onChange={() => onChange(option)}
                            className="
                                h-4 w-4
                                text-blue-600
                                border-gray-300
                                focus:ring-blue-500
                            "
                        />

                        <span className="text-sm">
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function CheckboxArrayField({
                                label,
                                value = [],
                                options,
                                onChange,
                            }) {
    const toggleOption = (option) => {
        if (value.includes(option)) {
            onChange(
                value.filter((item) => item !== option)
            );
        } else {
            onChange([
                ...value,
                option,
            ]);
        }
    };

    return (
        <div className="mb-4">
            <div className="border-l-4 border-indigo-600 pl-4 mb-2">
                <h2 className="font-bold text-slate-500">
                    {toTitleCase(label)}
                </h2>
            </div>
            <div className="flex flex-wrap gap-4 px-3 py-2
                    border rounded bg-white dark:bg-zinc-800
                    border-gray-300 dark:border-zinc-700">
                {options.map((option) => (
                    <label
                        key={option}
                        className="
                            inline-flex items-center gap-2
                            cursor-pointer
                        "
                    >
                        <input
                            type="checkbox"
                            value={option}
                            checked={value.includes(option)}
                            onChange={() =>
                                toggleOption(option)
                            }
                            className="
                                h-4 w-4
                                rounded
                                text-blue-600
                                border-gray-300
                                focus:ring-blue-500
                            "
                        />

                        <span className="text-sm">
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function BooleanField({ label, value, onChange }) {
    return (
        <div className="flex items-center justify-between py-2">
            <label className="block text-sm font-medium mb-2">
                {toTitleCase(label)}
            </label>
            <button
                type="button"
                role="switch"
                aria-checked={!!value}
                onClick={() => onChange(!value)}
                className={[
                    "relative inline-flex h-6 w-11 items-center rounded-full",
                    "transition-colors focus:outline-none",
                    value
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-zinc-700",
                ].join(" ")}
            >
                <span
                    className={[
                        "inline-block h-4 w-4 transform rounded-full bg-white",
                        "transition-transform",
                        value
                            ? "translate-x-6"
                            : "translate-x-1",
                    ].join(" ")}
                />
            </button>
        </div>
    );
}

function StringField({ label, value, onChange}) {
    return (
        <div className="mb-3">
            <div className="border-l-4 border-indigo-600 pl-4 mb-2">
                <h2 className="font-bold text-slate-500">
                    {toTitleCase(label)}
                </h2>
            </div>
            <input
                type="text"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
                className="
                    w-full border rounded px-3 py-2
                    bg-white dark:bg-zinc-800
                    border-gray-300 dark:border-zinc-700
                "
            />
        </div>
    );
}

function NumberField({ label, value, onChange }) {
    return (
        <div className="mb-3">
            <div className="border-l-4 border-indigo-600 pl-4 mb-1">
                <h2 className="font-bold text-slate-500">
                    {toTitleCase(label)}
                </h2>
            </div>
            <input
                type="number"
                value={value ?? ""}
                onChange={(e) => {
                    const next = e.target.value;

                    onChange(
                        next === ""
                            ? null
                            : Number(next)
                    );
                }}
                className="
                    w-full border rounded px-3 py-2
                    bg-white dark:bg-zinc-800
                    border-gray-300 dark:border-zinc-700
                "
            />
        </div>
    );
}

function DateField({ label, value, onChange }) {
    return (
        <div className="mb-3">
            <div className="border-l-4 border-indigo-600 pl-4 mb-1">
                <h2 className="font-bold text-slate-500">
                    {toTitleCase(label)}
                </h2>
            </div>
            <input
                type="date"
                value={toDateInputValue(value)}
                onChange={(e) =>
                    onChange(
                        fromDateInputValue(
                            e.target.value,
                            value
                        )
                    )
                }
                className="
                    w-full border rounded px-3 py-2
                    bg-white dark:bg-zinc-800
                    border-gray-300 dark:border-zinc-700
                "
            />
        </div>
    );
}

/* =========================================================
 * Primitive value renderer
 * ======================================================= */

function PrimitiveField({
                            label,
                            value,
                            path,
                            onChange,
                        }) {
    /*
     * editedAt
     */
    if (
        path[path.length - 1] ===
        "editedAt"
    ) {
        return (
            <DateTimeDisplay
                label={toTitleCase(label)}
                value={value}
            />
        );
    }

    /*
     * authenticator.type
     */
    if (
        path.length >= 2 &&
        path[path.length - 2] === "authenticator" &&
        path[path.length - 1] === "type"
    ) {
        return (
            <RadioField
                label="Type"
                value={value}
                options={SELECT_OPTIONS.authenticatorType}
                name={path.join(".")}
                onChange={onChange}
            />
        );
    }

    /*
     * messageBroker
     */
    if (
        path[path.length - 1] === "messageBroker"
    ) {
        return (
            <RadioField
                label={toTitleCase(label)}
                value={value}
                options={SELECT_OPTIONS.messageBroker}
                name={path.join(".")}
                onChange={onChange}
            />
        );
    }

    if (
        path[path.length - 1] === "messageBroker"
    ) {
        return (
            <RadioField
                label={toTitleCase(label)}
                value={value}
                options={SELECT_OPTIONS.messageBroker}
                name={path.join(".")}
                onChange={onChange}
            />
        );
    }

    /*
     * orm
     */
    if (
        path.length >= 2 &&
        path[path.length - 2] === "orm" &&
        path[path.length - 1] === "type"
    ) {
        return (
            <RadioField
                label={toTitleCase(label)}
                value={value}
                options={
                    SELECT_OPTIONS.orm
                }
                name={path.join(".")}
                onChange={onChange}
            />
        );
    }

    /*
     * responsibilitySegregation
     */
    if (
        path[path.length - 1] ===
        "responsibilitySegregation"
    ) {
        return (
            <RadioField
                label={toTitleCase(label)}
                value={value}
                options={
                    SELECT_OPTIONS.responsibilitySegregation
                }
                name={path.join(".")}
                onChange={onChange}
            />
        );
    }

    /*
     * Boolean
     */
    if (typeof value === "boolean") {
        return (
            <BooleanField
                label={toTitleCase(label)}
                value={value}
                onChange={onChange}
            />
        );
    }

    /*
     * Number
     */
    if (typeof value === "number") {
        return (
            <NumberField
                label={toTitleCase(label)}
                value={value}
                onChange={onChange}
            />
        );
    }

    /*
     * Date
     */
    if (isDateString(value)) {
        return (
            <DateField
                label={toTitleCase(label)}
                value={value}
                onChange={onChange}
            />
        );
    }

    /*
     * Default string
     */
    return (
        <StringField
            label={toTitleCase(label)}
            value={value}
            onChange={onChange}
        />
    );
}

/* =========================================================
 * Primitive Array
 *
 * Used by:
 *   eventPublishers
 *   domains
 * ======================================================= */

function PrimitiveArrayEditor({
                                  label,
                                  value = [],
                                  onChange,
                                  createValue,
                              }) {
    const addItem = () => {
        onChange([
            ...value,
            createValue(),
        ]);
    };

    const removeItem = (index) => {
        onChange(removeAt(value, index));
    };

    const updateItem = (index, nextValue) => {
        const next = [...value];
        next[index] = nextValue;
        onChange(next);
    };

    return (
        <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
                <div className="border-l-4 border-indigo-600 pl-4 mb-1">
                    <h2 className="font-bold text-slate-500">
                        {toTitleCase(label)}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={addItem}
                    className="
                        px-3 py-1 text-xs rounded
                        bg-blue-600 text-white
                        hover:bg-blue-700
                    "
                >
                    <LayersPlus/>
                </button>
            </div>

            {value.length === 0 && (
                <div className="text-sm text-gray-500 py-2">
                    No items
                </div>
            )}

            {value.map((item, index) => (
                <div
                    key={index}
                    className="flex gap-2 mb-2"
                >
                    <input
                        type="text"
                        value={item ?? ""}
                        onChange={(e) =>
                            updateItem(
                                index,
                                e.target.value
                            )
                        }
                        className="
                            flex-1 border rounded px-3 py-2
                            bg-white dark:bg-zinc-800
                            border-gray-300 dark:border-zinc-700
                        "
                    />

                    <button
                        type="button"
                        onClick={() =>
                            removeItem(index)
                        }
                        className="
                            px-3 py-2 rounded
                            bg-red-600 text-white
                            hover:bg-red-700
                        "
                    >
                        <LayersMinus/>
                    </button>
                </div>
            ))}
        </div>
    );
}

/* =========================================================
 * Object Array Editor
 *
 * Used by:
 *   projects
 *   externalConnectors
 *   interServers
 * ======================================================= */

function ObjectArrayEditor({
                               label,
                               value = [],
                               onChange,
                               createItem,
                               renderItem,
                           }) {
    const addItem = () => {
        onChange([
            ...value,
            createItem(),
        ]);
    };

    const removeItem = (index) => {
        onChange(removeAt(value, index));
    };

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <div className="border-l-4 border-indigo-600 pl-4 mb-1">
                    <h2 className="font-bold text-slate-500">
                        {toTitleCase(label)}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={addItem}
                    className="
                        px-3 py-1 text-sm rounded
                        bg-blue-600 text-white
                        hover:bg-blue-700
                    "
                >
                    <LayersPlus/>
                </button>
            </div>

            {value.length === 0 && (
                <div className="text-sm text-gray-500 py-2">
                    No {label.toLowerCase()}
                </div>
            )}

            {value.map((item, index) => (
                <ToggleField
                    key={index}
                    label={`${label.replace(/s$/, "")} ${index + 1}`}
                    defaultOpen={index === 0}
                >
                    <div className="relative">
                        {renderItem(item, index)}

                        <div className="flex justify-end mt-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() =>
                                    removeItem(index)
                                }
                                className="inline-flex
                                    px-3 py-1 text-sm rounded
                                    bg-red-600 text-white
                                    hover:bg-red-700
                                "
                            >
                                <LayersMinus className="mr-2"/>{`${toTitleCase(label)} ${index + 1}`}
                            </button>
                        </div>
                    </div>
                </ToggleField>
            ))}
        </div>
    );
}

/* =========================================================
 * Generic Object Editor
 * ======================================================= */

function ObjectEditor({
                          object,
                          path,
                          onChange,
                          specialArrayHandler,
                      }) {
    if (!isObject(object)) {
        return null;
    }

    return (
        <div className="space-y-1">
            {Object.entries(object).map(
                ([key, value]) => {
                    const currentPath = [
                        ...path,
                        key,
                    ];

                    /*
                     * Special arrays
                     */
                    if (Array.isArray(value)) {
                        const special =
                            specialArrayHandler?.(
                                key,
                                value,
                                currentPath
                            );

                        if (special) {
                            return (
                                <React.Fragment key={key}>
                                    {special}
                                </React.Fragment>
                            );
                        }

                        /*
                         * Generic primitive array
                         */
                        if (
                            value.every(
                                (item) =>
                                    typeof item !==
                                    "object" ||
                                    item === null
                            )
                        ) {
                            return (
                                <PrimitiveArrayEditor
                                    key={key}
                                    label={key}
                                    value={value}
                                    onChange={(next) =>
                                        onChange(
                                            currentPath,
                                            next
                                        )
                                    }
                                    createValue={() => ""}
                                />
                            );
                        }

                        /*
                         * Generic object array
                         */
                        return (
                            <ObjectArrayEditor
                                key={key}
                                label={key}
                                value={value}
                                onChange={(next) =>
                                    onChange(
                                        currentPath,
                                        next
                                    )
                                }
                                createItem={() => ({})}
                                renderItem={(item, index) => (
                                    <ObjectEditor
                                        object={item}
                                        path={[
                                            ...currentPath,
                                            index,
                                        ]}
                                        onChange={onChange}
                                        specialArrayHandler={
                                            specialArrayHandler
                                        }
                                    />
                                )}
                            />
                        );
                    }

                    /*
                     * Nested object
                     */
                    if (isObject(value)) {
                        return (
                            <ToggleField
                                key={key}
                                label={key}
                                defaultOpen={true}
                            >
                                <ObjectEditor
                                    object={value}
                                    path={currentPath}
                                    onChange={onChange}
                                    specialArrayHandler={
                                        specialArrayHandler
                                    }
                                />
                            </ToggleField>
                        );
                    }

                    /*
                     * Primitive
                     */
                    return (
                        <PrimitiveField
                            key={key}
                            label={key}
                            value={value}
                            path={currentPath}
                            onChange={(next) =>
                                onChange(
                                    currentPath,
                                    next
                                )
                            }
                        />
                    );
                }
            )}
        </div>
    );
}

/* =========================================================
 * ProfileDetail
 * ======================================================= */

export default function ProfileDetail({
                                          title,
                                          profile,
                                          handleChange,
                                          handleTitle,
                                          /*
                                           * Existing callbacks
                                           */
                                          onAddProject,
                                          onRemoveProject,

                                          /*
                                           * Optional callbacks for the other collections
                                           */
                                          onAddExternalConnector,
                                          onRemoveExternalConnector,

                                          onAddInterServer,
                                          onRemoveInterServer,

                                          onAddDomain,
                                          onRemoveDomain,

                                          onAddEventPublisher,
                                          onRemoveEventPublisher,
                                      }) {
    /*
     * Central update function.
     *
     * Parent can implement:
     *
     * const handleProfileChange = (path, value) => {
     *     setEditingProfile(prev =>
     *         setByPath(prev, path, value)
     *     );
     * };
     */
    const updateTitle = React.useCallback(
        (value) => {
            if (typeof handleTitle === "function") {
                handleTitle(value);
            }
        },
        [handleTitle]
    );

    /*
     * update field value
     */
    const updateValue = React.useCallback(
        (path, value) => {
            if (typeof handleChange === "function") {
                handleChange(path, value);
            }
        },
        [handleChange]
    );

    /*
     * Array add/remove helpers
     */
    const updateArray = React.useCallback(
        (path, nextArray) => {
            updateValue(path, nextArray);
        },
        [updateValue]
    );

    /*
     * Special array renderer.
     *
     * This is where the domain-specific arrays are handled.
     */
    const specialArrayHandler = React.useCallback(
        (key, value, path) => {
            /*
             * ---------------------------------------------
             * externalConnectors
             * ---------------------------------------------
             */
            if (key === "externalConnectors") {
                return (
                    <ObjectArrayEditor
                        label={key}
                        value={value}
                        onChange={(next) => {
                            updateArray(path, next);
                        }}
                        createItem={() =>
                            createEmptyExternalConnector()
                        }
                        renderItem={(item, index) => (
                            <ObjectEditor
                                object={item}
                                path={[
                                    ...path,
                                    index,
                                ]}
                                onChange={updateValue}
                                specialArrayHandler={
                                    specialArrayHandler
                                }
                            />
                        )}
                    />
                );
            }

            /*
             * ---------------------------------------------
             * projects
             * ---------------------------------------------
             */
            if (key === "projects") {
                return (
                    <ObjectArrayEditor
                        label={key}
                        value={value}
                        onChange={(next) => {
                            /*
                             * If parent supplied its own
                             * callback, let parent handle it.
                             */
                            if (
                                typeof onAddProject ===
                                "function" &&
                                next.length > value.length
                            ) {
                                const added =
                                    next[next.length - 1];

                                onAddProject(added);
                                return;
                            }

                            if (
                                typeof onRemoveProject ===
                                "function" &&
                                next.length < value.length
                            ) {
                                const removedIndex =
                                    value.findIndex(
                                        (item) =>
                                            !next.includes(item)
                                    );

                                onRemoveProject(
                                    removedIndex
                                );
                                return;
                            }

                            updateArray(path, next);
                        }}
                        createItem={() =>
                            createEmptyProject()
                        }
                        renderItem={(item, index) => (
                            <ObjectEditor
                                object={item}
                                path={[
                                    ...path,
                                    index,
                                ]}
                                onChange={updateValue}
                                specialArrayHandler={
                                    specialArrayHandler
                                }
                            />
                        )}
                    />
                );
            }

            /*
             * ---------------------------------------------
             * interServers
             * ---------------------------------------------
             */
            if (key === "interServers") {
                return (
                    <ObjectArrayEditor
                        label={key}
                        value={value}
                        onChange={(next) => {
                            if (
                                typeof onAddInterServer ===
                                "function" &&
                                next.length > value.length
                            ) {
                                onAddInterServer(
                                    next[next.length - 1]
                                );
                                return;
                            }

                            if (
                                typeof onRemoveInterServer ===
                                "function" &&
                                next.length < value.length
                            ) {
                                const removedIndex =
                                    value.findIndex(
                                        (item) =>
                                            !next.includes(item)
                                    );

                                onRemoveInterServer(
                                    removedIndex
                                );
                                return;
                            }

                            updateArray(path, next);
                        }}
                        createItem={() =>
                            createEmptyInterServer()
                        }
                        renderItem={(item, index) => (
                            <ObjectEditor
                                object={item}
                                path={[
                                    ...path,
                                    index,
                                ]}
                                onChange={updateValue}
                                specialArrayHandler={
                                    specialArrayHandler
                                }
                            />
                        )}
                    />
                );
            }

            /*
             * ---------------------------------------------
             * domains
             * ---------------------------------------------
             *
             * In your JSON this is:
             *
             * "domains": [
             *   "Member"
             * ]
             */
            if (key === "domains") {
                return (
                    <PrimitiveArrayEditor
                        label={key}
                        value={value}
                        onChange={(next) => {
                            if (
                                typeof onAddDomain ===
                                "function" &&
                                next.length > value.length
                            ) {
                                onAddDomain(
                                    next[next.length - 1]
                                );
                                return;
                            }

                            if (
                                typeof onRemoveDomain ===
                                "function" &&
                                next.length < value.length
                            ) {
                                const removedIndex =
                                    value.findIndex(
                                        (item) =>
                                            !next.includes(item)
                                    );

                                onRemoveDomain(
                                    removedIndex
                                );
                                return;
                            }

                            updateArray(path, next);
                        }}
                        createValue={() => ""}
                    />
                );
            }

            /*
             * ---------------------------------------------
             * eventPublishers
             * ---------------------------------------------
             *
             * Example:
             *
             * "eventPublishers": [
             *   "REDIS",
             *   "KAFKA"
             * ]
             */
            if (key === "eventPublishers") {
                return (
                    <CheckboxArrayField
                        label={key}
                        value={value}
                        options={SELECT_OPTIONS.messageBroker}
                        onChange={(next) => {
                            updateArray(path, next);
                        }}
                    />
                );
            }

            /*
             * Return null for all other arrays so that
             * ObjectEditor handles them generically.
             */
            return null;
        },
        [
            updateArray,
            updateValue,

            onAddProject,
            onRemoveProject,

            onAddExternalConnector,
            onRemoveExternalConnector,

            onAddInterServer,
            onRemoveInterServer,

            onAddDomain,
            onRemoveDomain,

            onAddEventPublisher,
            onRemoveEventPublisher,
        ]
    );

    if (!profile) {
        return (
            <div className="p-4 text-gray-500">
                Generator server unavailable...
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-t">
                <PrimitiveField
                    label="Title"
                    value={title}
                    path={[]}
                    onChange={updateTitle}
                />
                <div className="border-b" />
            </div>
            {/* Body */}
            <div className="flex-1 overflow-auto p-4">
                <ObjectEditor
                    object={profile}
                    path={[]}
                    onChange={updateValue}
                    specialArrayHandler={
                        specialArrayHandler
                    }
                />
            </div>
        </div>
    );
}