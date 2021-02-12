import React, { useState, useEffect, useRef } from 'react';
import { Typeahead, Highlighter } from 'react-bootstrap-typeahead';
import { Button, ButtonGroup, Alert } from 'react-bootstrap';
import createPersistedState from 'use-persisted-state';
import { ImArrowLeft2, ImArrowRight2 } from 'react-icons/im';

import { Wrapper } from 'components/wrapper';
import { Presenter } from 'components/presenter';
import { Controls } from 'components/controls';
import { Sidebar } from 'components/sidebar';
import { Bookmark, createStorageKey } from 'components/bookmark';
import { List } from 'components/list';

import { useVerse, useMoveVerse, useKeyDown } from 'hooks';
import { Storage, getBookmarkedItems } from 'utils';
import {
  ITEMS_PER_LIST,
  CHANNEL_NAME,
  SETTINGS_NAME,
  SETTINGS_INITIAL_STATE,
} from 'values';

const useBroadcast = createPersistedState(CHANNEL_NAME);
const useSettings = createPersistedState(SETTINGS_NAME);

function ScripturesView() {
  const typeaheadRef = useRef();
  const { scriptures, verse, setVerse } = useVerse();
  const { moveChapter, moveVerse } = useMoveVerse();
  const [, setMessage] = useBroadcast(null);
  const [settings] = useSettings(SETTINGS_INITIAL_STATE);
  const [showLogo, setShowLogo] = useState(true);
  const [search, setSearch] = useState([verse]);
  const [bookmarkedItems, setBookmarkedItems] = useState(
    getBookmarkedItems('verse')
  );

  useEffect(() => {
    setMessage(showLogo ? null : verse);
  }, [verse, showLogo, setMessage]);

  useEffect(() => {
    return () => setMessage(null);
  }, []);

  function onSearch(event) {
    setSearch(event);

    if (event.length) {
      setVerse(...event);
      typeaheadRef.current.blur();
    }
  }

  const onPrevVerse = () => {
    const verse = moveVerse(-1);
    setSearch([verse]);
  };

  const onNextVerse = () => {
    const verse = moveVerse(1);
    setSearch([verse]);
  };

  const onPrevChapter = () => {
    const verse = moveChapter(-1);
    setSearch([verse]);
  };

  const onNextChapter = () => {
    const verse = moveChapter(1);
    setSearch([verse]);
  };

  const removeBookmarks = () => {
    bookmarkedItems.forEach((item) => {
      Storage.remove(createStorageKey(item));
    });
    setBookmarkedItems(getBookmarkedItems('verse'));
  };

  useKeyDown('ArrowLeft', onPrevVerse);
  useKeyDown('ArrowRight', onNextVerse);
  useKeyDown('ArrowUp', onNextChapter);
  useKeyDown('ArrowDown', onPrevChapter);
  useKeyDown('F1', () => typeaheadRef.current.focus());

  return (
    <Wrapper>
      <Sidebar>
        <h1 className="text-light display-4">Escrituras</h1>
        <Typeahead
          emptyLabel="No existe esa opcion."
          highlightOnlyResult={true}
          id="combo"
          labelKey="cite"
          minLength={0}
          onChange={onSearch}
          onFocus={(e) => e.target.select()}
          options={scriptures}
          paginate={false}
          paginationText="Ver más opciones..."
          placeholder="Selecciona un versículo..."
          ref={typeaheadRef}
          selected={search}
          size="large"
          renderMenuItemChildren={(option, { text }) => (
            <>
              <Highlighter search={text}>{option.cite}</Highlighter>
              <small
                className="d-block overflow-hidden font-italic"
                style={{ textOverflow: 'ellipsis' }}
                title={option.text.replaceAll('<br/>', '\n')}
              >
                {option.text.replaceAll('<br/>', ' ')}
              </small>
            </>
          )}
        />
        <div className="small text-muted d-block mt-1">
          Presiona <strong>F1</strong> para buscar.
        </div>

        <Button
          className="mt-3"
          block
          size="lg"
          variant={showLogo ? 'secondary' : 'warning'}
          onClick={() => setShowLogo((value) => !value)}
        >
          {showLogo ? 'Mostrar Versículo' : 'Mostrar Logo'}
        </Button>

        <List>
          <List.Item>
            {bookmarkedItems.length ? (
              <>
                <List.Title>Marcadores</List.Title>
                <List.Action className="text-right" onClick={removeBookmarks}>
                  (Borrar)
                </List.Action>
              </>
            ) : null}
          </List.Item>

          {bookmarkedItems.map((item, index) => {
            return index < ITEMS_PER_LIST ? (
              <List.Item key={item.index}>
                <List.Action onClick={() => onSearch([item])}>
                  {item.cite}
                </List.Action>
                <Bookmark icon element={item} onRefresh={setBookmarkedItems} />
              </List.Item>
            ) : null;
          })}

          {bookmarkedItems.length > ITEMS_PER_LIST ? (
            <List.Item>
              <List.Text>
                +{bookmarkedItems.length - ITEMS_PER_LIST} marcadores
              </List.Text>
            </List.Item>
          ) : null}
        </List>
      </Sidebar>

      <Wrapper direction="column">
        <Bookmark element={verse} onRefresh={setBookmarkedItems} />

        <Alert className="m-0 br-0" variant="secondary">
          {showLogo ? (
            <>
              Actualmente <strong>NO</strong> se está mostrando el versículo al
              público.
            </>
          ) : (
            <>
              Actualmente se está mostrando el versículo{' '}
              <strong>{verse.cite}</strong> al público.
            </>
          )}
        </Alert>

        <Presenter
          live={!showLogo}
          subtext={verse.cite}
          size={verse.size}
          {...settings}
        >
          {verse.text}
        </Presenter>

        <div className="text-muted bg-white py-2 px-3 d-flex justify-content-between">
          <small>
            Usa las teclas <strong>&larr;</strong> y <strong>&rarr;</strong>{' '}
            para cambiar de versículo, y <strong>&uarr;</strong> y{' '}
            <strong>&darr;</strong> para cambiar de capítulo.
          </small>
        </div>

        <Controls centered>
          <ButtonGroup>
            <Button onClick={onPrevVerse} variant="secondary">
              <ImArrowLeft2 />
            </Button>

            <Button onClick={onNextVerse} variant="secondary">
              <ImArrowRight2 />
            </Button>
          </ButtonGroup>
        </Controls>
      </Wrapper>
    </Wrapper>
  );
}

export default ScripturesView;
