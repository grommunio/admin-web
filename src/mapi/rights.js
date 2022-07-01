/* eslint-disable no-unused-vars */
export const rights = {
  /**
   * Denotes that no rights are given
   * @property
   * @type Number
   */
  RIGHTS_NONE: 0x00000000,
  /**
   * Denotes that read rights are given
   * @property
   * @type Number
   */
  RIGHTS_READ_ANY: 0x00000001,
  /**
   * Denotes that create rights are given
   * @property
   * @type Number
   */
  RIGHTS_CREATE: 0x00000002,
  /**
   * Denotes that edit rights are given for items owned by the user
   * @property
   * @type Number
   */
  RIGHTS_EDIT_OWNED: 0x00000008,
  /**
   * Denotes that delete rights are given for items owned by the user
   * @property
   * @type Number
   */
  RIGHTS_DELETE_OWNED: 0x00000010,
  /**
   * Denotes that edit rights are given for all items
   * @property
   * @type Number
   */
  RIGHTS_EDIT_ANY: 0x00000020,
  /**
   * Denotes that delete rights are given for all items
   * @property
   * @type Number
   */
  RIGHTS_DELETE_ANY: 0x00000040,
  /**
   * Denotes that create subfolders rights are given
   * @property
   * @type Number
   */
  RIGHTS_CREATE_SUBFOLDER: 0x00000080,
  /**
   * Denotes that folder access rights are given
   * @property
   * @type Number
   */
  RIGHTS_CREATE_FOLDER: 0x00000100,
  /**
   * Denotes that folder access rights are given
   * @property
   * @type Number
   */
  RIGHTS_FOLDER_CONTACT: 0x00000200,
  /**
   * Denotes that folder visibility rights are given
   * @property
   * @type Number
   */
  RIGHTS_FOLDER_VISIBLE: 0x00000400,
  /**
   * Denotes that detailed free/busy visibility rights are given
   * @property
   * @type Number
   */
  RIGHTS_FBSIMPLE: 0x00000800,
  /**
   * Denotes that detailed free/busy visibility rights are given
   * @property
   * @type Number
   */
  RIGHTS_FBDETAILED: 0x00001000,
};

const RIGHTS_NO_RIGHTS = rights.RIGHTS_NONE;

const RIGHTS_CONTRIBUTOR = rights.RIGHTS_FOLDER_VISIBLE | rights.RIGHTS_CREATE;

const RIGHTS_READONLY = rights.RIGHTS_FOLDER_VISIBLE | rights.RIGHTS_READ_ANY;

const RIGHTS_REVIEWER = rights.RIGHTS_READ_ANY | rights.RIGHTS_FOLDER_VISIBLE;

const RIGHTS_NONEDITINGAUTHOR = RIGHTS_REVIEWER | rights.RIGHTS_CREATE | rights.RIGHTS_DELETE_OWNED;

const RIGHTS_AUTHOR = RIGHTS_NONEDITINGAUTHOR | rights.RIGHTS_EDIT_OWNED;

const RIGHTS_PUBLISHINGAUTHOR = RIGHTS_AUTHOR | rights.RIGHTS_CREATE_SUBFOLDER;

const RIGHTS_EDITOR = RIGHTS_AUTHOR | rights.RIGHTS_DELETE_ANY | rights.RIGHTS_EDIT_ANY;

const RIGHTS_PUBLISHINGEDITOR = RIGHTS_EDITOR | rights.RIGHTS_CREATE_SUBFOLDER;

const RIGHTS_SECRETARY = RIGHTS_READONLY |
  rights.RIGHTS_CREATE | rights.RIGHTS_EDIT_OWNED | rights.RIGHTS_DELETE_OWNED |
  rights.RIGHTS_EDIT_ANY | rights.RIGHTS_DELETE_ANY;

const RIGHTS_FULL_CONTROL = RIGHTS_SECRETARY |
  rights.RIGHTS_CREATE_SUBFOLDER;

const RIGHTS_OWNER = RIGHTS_PUBLISHINGEDITOR | rights.RIGHTS_CREATE_FOLDER | rights.RIGHTS_FOLDER_CONTACT;

const RIGHTS_CAL_FBSIMPLE = rights.RIGHTS_NONE |
  rights.RIGHTS_FBSIMPLE;

const RIGHTS_CAL_FBDETAILED = rights.RIGHTS_NONE |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_FBDETAILED;

const RIGHTS_CAL_CONTRIBUTOR = rights.RIGHTS_FOLDER_VISIBLE |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_CREATE;

const RIGHTS_CAL_REVIEWER = rights.RIGHTS_READ_ANY |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_FBDETAILED |
  rights.RIGHTS_FOLDER_VISIBLE;

const RIGHTS_CAL_NONEDITINGAUTHOR = RIGHTS_REVIEWER |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_FBDETAILED |
  rights.RIGHTS_CREATE |
  rights.RIGHTS_DELETE_OWNED;

const RIGHTS_CAL_AUTHOR = RIGHTS_NONEDITINGAUTHOR |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_FBDETAILED |
  rights.RIGHTS_EDIT_OWNED;

const RIGHTS_CAL_PUBLISHINGAUTHOR = RIGHTS_AUTHOR |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_FBDETAILED |
  rights.RIGHTS_CREATE_SUBFOLDER;

const RIGHTS_CAL_EDITOR = RIGHTS_AUTHOR |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_FBDETAILED |
  rights.RIGHTS_DELETE_ANY |
  rights.RIGHTS_EDIT_ANY;

const RIGHTS_CAL_PUBLISHINGEDITOR = RIGHTS_EDITOR |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_FBDETAILED |
  rights.RIGHTS_CREATE_SUBFOLDER;

const RIGHTS_CAL_OWNER = RIGHTS_PUBLISHINGEDITOR |
  rights.RIGHTS_CREATE_FOLDER |
  rights.RIGHTS_FBSIMPLE |
  rights.RIGHTS_FBDETAILED |
  rights.RIGHTS_FOLDER_CONTACT;

export const permissionProfiles = [{
  value: RIGHTS_OWNER,
  name: 'Owner',
}, {
  value: RIGHTS_PUBLISHINGEDITOR,
  name: 'Publishing Editor',
}, {
  value: RIGHTS_EDITOR,
  name: 'Editor',
}, {
  value: RIGHTS_PUBLISHINGAUTHOR,
  name: 'Publishing Author',
}, {
  value: RIGHTS_AUTHOR,
  name: 'Author',
}, {
  value: RIGHTS_NONEDITINGAUTHOR,
  name: 'Nonediting Author',
}, {
  value: RIGHTS_REVIEWER,
  name: 'Reviewer',
}, {
  value: RIGHTS_CONTRIBUTOR,
  name: 'Contributor',
}, {
  value: RIGHTS_NO_RIGHTS,
  name: 'None',
}];