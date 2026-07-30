// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Match, Show, Switch } from "solid-js";
import type {
  ActionSpec,
  PresentationEvent,
  PresentationNode,
} from "../types/presentation";
import { actionActivated, valueChanged } from "./events";
import { QrPresentation } from "./QrPresentation";

interface Props {
  node: PresentationNode;
  surfaceId: string;
  onEvent: (event: PresentationEvent) => void;
}

interface ActionProps {
  action: ActionSpec;
  surfaceId: string;
  class?: string;
  onEvent: (event: PresentationEvent) => void;
}

function ActionButton(props: ActionProps) {
  return (
    <button
      type="button"
      class={props.class}
      data-presentation-id={props.action.interaction_id}
      aria-label={props.action.accessibility_label}
      disabled={!props.action.enabled}
      onClick={() => props.onEvent(
        actionActivated(props.surfaceId, props.action.interaction_id),
      )}
    >
      {props.action.label}
    </button>
  );
}

function bytesToImage(bytes: number[] | null): string | null {
  if (!bytes?.length) return null;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:image/webp;base64,${btoa(binary)}`;
}

export function PresentationNodeRenderer(props: Props) {
  if (props.node === "Divider") return <hr class="presentation-divider" />;
  const node = props.node;

  return (
    <Switch fallback={<div role="status">Unsupported presentation node</div>}>
      <Match when={"Text" in node ? node.Text : undefined}>
        {(text) => (
          <p
            class={`presentation-text presentation-text-${text().style}`}
            aria-label={text().accessibility.label}
            aria-description={text().accessibility.description ?? undefined}
          >
            {text().content}
          </p>
        )}
      </Match>
      <Match when={"Input" in node ? node.Input : undefined}>
        {(input) => (
          <label class="presentation-input">
            <span>{input().label}</span>
            <input
              type={input().input_kind}
              value={input().value}
              placeholder={input().placeholder ?? undefined}
              maxLength={input().max_length ?? undefined}
              disabled={!input().enabled}
              data-presentation-id={input().binding_id}
              aria-label={input().accessibility.label}
              aria-description={input().accessibility.description ?? undefined}
              aria-invalid={Boolean(input().validation_error)}
              onInput={(event) => props.onEvent(
                valueChanged(
                  props.surfaceId,
                  input().binding_id,
                  { Text: event.currentTarget.value },
                ),
              )}
            />
            <Show when={input().validation_error}>
              {(error) => <span class="presentation-error">{error()}</span>}
            </Show>
          </label>
        )}
      </Match>
      <Match when={"Toggle" in node ? node.Toggle : undefined}>
        {(toggle) => (
          <label class="presentation-toggle">
            <span>{toggle().label}</span>
            <input
              type="checkbox"
              checked={toggle().value}
              disabled={!toggle().enabled}
              data-presentation-id={toggle().binding_id}
              aria-label={toggle().accessibility.label}
              onChange={(event) => props.onEvent(
                valueChanged(
                  props.surfaceId,
                  toggle().binding_id,
                  { Boolean: event.currentTarget.checked },
                ),
              )}
            />
          </label>
        )}
      </Match>
      <Match when={"Choice" in node ? node.Choice : undefined}>
        {(choice) => (
          <label class="presentation-input">
            <span>{choice().label}</span>
            <select
              value={choice().selected ?? ""}
              disabled={!choice().enabled}
              data-presentation-id={choice().binding_id}
              aria-label={choice().accessibility.label}
              onChange={(event) => props.onEvent(
                valueChanged(
                  props.surfaceId,
                  choice().binding_id,
                  { Choice: event.currentTarget.value || null },
                ),
              )}
            >
              <option value="">—</option>
              <For each={choice().options}>
                {(option) => <option value={option.id}>{option.label}</option>}
              </For>
            </select>
          </label>
        )}
      </Match>
      <Match when={"Group" in node ? node.Group : undefined}>
        {(group) => (
          <section
            class={`presentation-group presentation-group-${group().axis}`}
            aria-label={group().accessibility.label}
          >
            <Show when={group().label}>
              {(label) => <h3>{label()}</h3>}
            </Show>
            <For each={group().children}>
              {(child) => (
                <PresentationNodeRenderer
                  node={child}
                  surfaceId={props.surfaceId}
                  onEvent={props.onEvent}
                />
              )}
            </For>
          </section>
        )}
      </Match>
      <Match when={"List" in node ? node.List : undefined}>
        {(list) => (
          <section class="presentation-list" aria-label={list().accessibility.label}>
            <Show when={list().label}>
              {(label) => <h3>{label()}</h3>}
            </Show>
            <For each={list().rows}>
              {(row) => (
                <article class={`presentation-row${row.selected ? " is-selected" : ""}`}>
                  <Show
                    when={row.activation}
                    fallback={<RowContent row={row} />}
                  >
                    {(activation) => (
                      <button
                        type="button"
                        class="presentation-row-activation"
                        disabled={!row.enabled || !activation().enabled}
                        data-presentation-id={activation().interaction_id}
                        aria-label={row.accessibility.label}
                        onClick={() => props.onEvent(actionActivated(
                          props.surfaceId,
                          activation().interaction_id,
                        ))}
                      >
                        <RowContent row={row} />
                      </button>
                    )}
                  </Show>
                  <For each={row.controls}>
                    {(control) => (
                      <PresentationNodeRenderer
                        node={control}
                        surfaceId={props.surfaceId}
                        onEvent={props.onEvent}
                      />
                    )}
                  </For>
                  <Show when={row.secondary_actions.length}>
                    <details class="presentation-row-menu">
                      <summary aria-label="Row actions">•••</summary>
                      <div>
                        <For each={row.secondary_actions}>
                          {(action) => (
                            <ActionButton
                              action={action}
                              surfaceId={props.surfaceId}
                              onEvent={props.onEvent}
                            />
                          )}
                        </For>
                      </div>
                    </details>
                  </Show>
                </article>
              )}
            </For>
          </section>
        )}
      </Match>
      <Match when={"Image" in node ? node.Image : undefined}>
        {(image) => {
          const content = () => (
            <Show
              when={bytesToImage(image().data)}
              fallback={<span>{image().fallback_text ?? ""}</span>}
            >
              {(source) => (
                <img
                  src={source()}
                  alt={image().accessibility.label}
                  style={{ filter: `brightness(${image().brightness})` }}
                />
              )}
            </Show>
          );
          return (
            <Show
              when={image().activation}
              fallback={
                <div class={`presentation-image presentation-image-${image().shape}`}>
                  {content()}
                </div>
              }
            >
              {(activation) => (
                <button
                  class={`presentation-image presentation-image-${image().shape}`}
                  data-presentation-id={activation().interaction_id}
                  aria-label={activation().accessibility_label}
                  disabled={!activation().enabled}
                  onClick={() => props.onEvent(actionActivated(
                    props.surfaceId,
                    activation().interaction_id,
                  ))}
                >
                  {content()}
                </button>
              )}
            </Show>
          );
        }}
      </Match>
      <Match when={"Status" in node ? node.Status : undefined}>
        {(status) => (
          <article class={`presentation-status presentation-tone-${status().tone}`}>
            <div>
              <strong>{status().title}</strong>
              <Show when={status().detail}>{(detail) => <span>{detail()}</span>}</Show>
            </div>
            <Show when={status().badge}>{(badge) => <span>{badge()}</span>}</Show>
            <Show when={status().activation}>
              {(activation) => (
                <ActionButton
                  action={activation()}
                  surfaceId={props.surfaceId}
                  onEvent={props.onEvent}
                />
              )}
            </Show>
          </article>
        )}
      </Match>
      <Match when={"Qr" in node ? node.Qr : undefined}>
        {(qr) => (
          <QrPresentation
            node={qr()}
            surfaceId={props.surfaceId}
            onEvent={props.onEvent}
          />
        )}
      </Match>
      <Match when={"Confirmation" in node ? node.Confirmation : undefined}>
        {(confirmation) => (
          <section
            class="presentation-confirmation"
            aria-label={confirmation().accessibility.label}
          >
            <p>{confirmation().warning}</p>
            <div>
              <ActionButton
                action={confirmation().cancel}
                surfaceId={props.surfaceId}
                onEvent={props.onEvent}
              />
              <ActionButton
                action={confirmation().confirm}
                surfaceId={props.surfaceId}
                class="is-primary"
                onEvent={props.onEvent}
              />
            </div>
          </section>
        )}
      </Match>
      <Match when={"Slider" in node ? node.Slider : undefined}>
        {(slider) => (
          <label class="presentation-slider">
            <span>{slider().label}</span>
            <input
              type="range"
              min={slider().minimum}
              max={slider().maximum}
              step={slider().step ?? "any"}
              value={slider().value}
              data-presentation-id={slider().binding_id}
              aria-label={slider().accessibility.label}
              onInput={(event) => props.onEvent(valueChanged(
                props.surfaceId,
                slider().binding_id,
                { Number: event.currentTarget.valueAsNumber },
              ))}
            />
          </label>
        )}
      </Match>
      <Match when={"Progress" in node ? node.Progress : undefined}>
        {(progress) => (
          <div class="presentation-progress">
            <Show when={progress().label}>{(label) => <span>{label()}</span>}</Show>
            <progress
              value={progress().value ?? undefined}
              aria-label={progress().accessibility.label}
            />
          </div>
        )}
      </Match>
    </Switch>
  );
}

function RowContent(props: { row: {
  title: string;
  subtitle: string | null;
  detail: string | null;
  fallback_text: string | null;
  image_data: number[] | null;
} }) {
  return (
    <>
      <Show
        when={bytesToImage(props.row.image_data)}
        fallback={
          <Show when={props.row.fallback_text}>
            {(fallback) => <span class="presentation-row-fallback">{fallback()}</span>}
          </Show>
        }
      >
        {(source) => <img src={source()} alt="" />}
      </Show>
      <span class="presentation-row-copy">
        <strong>{props.row.title}</strong>
        <Show when={props.row.subtitle}>{(subtitle) => <span>{subtitle()}</span>}</Show>
      </span>
      <Show when={props.row.detail}>{(detail) => <span>{detail()}</span>}</Show>
    </>
  );
}
